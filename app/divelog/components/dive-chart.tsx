"use client"

import { memo, useRef, useEffect, useCallback, useState } from "react"
import NextImage from "next/image"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Customized } from "recharts"
import { ArrowDownFromLine, Clock, Timer, Play, Image } from "lucide-react"
import { useIsMobile } from "@/app/divelog/hooks/use-mobile"

export interface ProcessedMedia {
  blobUrl: string
  thumbnailUrl: string
  timestamp: Date
  isImage: boolean
  isVideo: boolean
  timeOffset: number
  chartTime: number
  depth: number
  formattedTime: string
}

interface DiveChartProps {
  diveNumber: number
  chartData: Array<{ time: number; depth: number }>
  baseChartData: Array<{ time: number; depth: number }>
  extendedDataBefore: Array<{ time: number; depth: number }>
  extendedDataAfter: Array<{ time: number; depth: number }>
  minChartTime: number
  maxChartTime: number
  shouldExtendBefore: boolean
  shouldExtendAfter: boolean
  isNightDive: boolean
  diveMedia: ProcessedMedia[]
  setHoveredMediaIndex: (index: number | null) => void
  diveStartTime: number
  failedThumbnails: React.MutableRefObject<Set<string>>
  onThumbnailError: (url: string) => void
}

// Media image component with error handling
function MediaImage({
  thumbnailUrl,
  failedThumbnails,
  onThumbnailError
}: {
  thumbnailUrl: string;
  failedThumbnails: React.MutableRefObject<Set<string>>;
  onThumbnailError: (url: string) => void;
}) {
  const hasFailed = failedThumbnails.current.has(thumbnailUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        size={20}
        style={{
          color: 'var(--divelog-foreground)',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          opacity: hasFailed ? 1 : 0,
        }}
      />
      {!hasFailed && (
        <NextImage
          src={thumbnailUrl}
          alt=""
          width={200}
          height={200}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1,
          }}
          onError={() => {
            onThumbnailError(thumbnailUrl);
          }}
          unoptimized={true}
        />
      )}
    </div>
  );
}

// Custom active dot component for hover - shows profile picture with white border
// Simple function component - Recharts handles memoization internally
function ActiveDot(props: any) {
  const { cx, cy } = props;
  const radius = 12;
  const size = radius * 2;
  return (
    <foreignObject
      x={cx - radius}
      y={cy - radius}
      width={size}
      height={size}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid white',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <NextImage
          src="/profile.jpg"
          alt="Diver"
          width={24}
          height={24}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          unoptimized={true}
        />
      </div>
    </foreignObject>
  );
}

export const DiveChart = memo(function DiveChart({
  diveNumber,
  chartData,
  baseChartData,
  extendedDataBefore,
  extendedDataAfter,
  minChartTime,
  maxChartTime,
  shouldExtendBefore,
  shouldExtendAfter,
  isNightDive,
  diveMedia,
  setHoveredMediaIndex,
  diveStartTime,
  failedThumbnails,
  onThumbnailError
}: DiveChartProps) {
  const isMobile = useIsMobile()
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const xAxisScaleRef = useRef<((value: number) => number) | null>(null);
  const scaleReadyRef = useRef(false);
  const currentHoveredIndexRef = useRef<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);

  // Reveal markers once the chart scale becomes available (without rerendering markers).
  useEffect(() => {
    if (!chartContainerRef.current) return;
    // Ensure we start hidden (handles remounts/resizes).
    chartContainerRef.current.style.setProperty('--markers-opacity', '0');

    const interval = setInterval(() => {
      if (scaleReadyRef.current && chartContainerRef.current) {
        chartContainerRef.current.style.setProperty('--markers-opacity', '1');
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Store markers rendered state to prevent re-renders after initial render
  const markersRenderedRef = useRef(false);
  const markersDataRef = useRef(diveMedia);
  const failedThumbnailsRef = useRef(failedThumbnails);
  const onThumbnailErrorRef = useRef(onThumbnailError);

  // Update refs when values change (but don't trigger re-render)
  useEffect(() => {
    markersDataRef.current = diveMedia;
    failedThumbnailsRef.current = failedThumbnails;
    onThumbnailErrorRef.current = onThumbnailError;
  }, [diveMedia, failedThumbnails, onThumbnailError]);

  // Media markers component - renders all media markers on the chart
  // Rendered once and never re-rendered to prevent flickering
  // Use useCallback with empty deps to create a stable reference
  const MediaMarkers = useCallback((props: any) => {
    const { xAxisMap, yAxisMap } = props;
    if (!xAxisMap || !yAxisMap || markersDataRef.current.length === 0) return null;

    const xAxis = Object.values(xAxisMap)[0] as any;
    const yAxis = Object.values(yAxisMap)[0] as any;

    if (!xAxis || !yAxis) return null;

    // Store the XAxis scale for mouse tracking and mark scale as ready
    if (xAxis.scale && yAxis.scale && typeof xAxis.scale === 'function' && typeof yAxis.scale === 'function') {
      xAxisScaleRef.current = xAxis.scale;
      // Mark scale as ready using ref (will trigger state update via useEffect)
      if (!scaleReadyRef.current) {
        scaleReadyRef.current = true;
      }
      // Mark markers as rendered once scale is ready
      if (!markersRenderedRef.current) {
        markersRenderedRef.current = true;
      }
    }

    const radius = 8;
    const size = radius * 2;
    const scaleFactor = 1.2;
    // Make container larger to accommodate scaled content
    const containerSize = size * scaleFactor;
    const containerOffset = (containerSize - size) / 2;

    // Always use the ref data - it's updated via useEffect without causing re-renders
    const mediaToRender = markersDataRef.current;

    return (
      <>
        <style>{`
          .media-marker {
            transition: transform 0.1s ease, opacity 0.5s ease-in-out;
            transform-origin: center center;
            pointer-events: none;
          }
          .media-marker:hover {
            transform: scale(1.2);
            animation: none;
          }
          @keyframes videoPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          .media-marker-video {
            animation: videoPulse 2s ease-in-out infinite;
          }
          .media-marker-video:hover {
            animation: none;
          }
        `}</style>
        <g style={{ pointerEvents: 'none' }}>
          {mediaToRender.map((media, originalIndex) => {
            // Calculate positions - position off-screen if scale isn't ready
            const hasValidScale = xAxis.scale && yAxis.scale && typeof xAxis.scale === 'function' && typeof yAxis.scale === 'function';
            let xPos: number, yPos: number;

            if (hasValidScale) {
              xPos = xAxis.scale(media.chartTime);
              yPos = yAxis.scale(media.depth);
            } else {
              // Scale not ready yet - position off-screen temporarily
              xPos = -1000;
              yPos = -1000;
            }

            // If scale exists but returns invalid values, position off-screen
            const isValidPosition = hasValidScale && !isNaN(xPos) && !isNaN(yPos) && xPos !== undefined && yPos !== undefined && xPos >= -500;

            if (hasValidScale && !isValidPosition) {
              // Still render the marker but position it off-screen
              xPos = -1000;
              yPos = -1000;
            }

            const x = xPos - radius - containerOffset;
            const y = yPos - radius - containerOffset;

              return (
                <foreignObject
                  key={`${originalIndex}-${media.blobUrl}`}
                  x={x}
                  y={y - 32}
                  width={containerSize}
                  height={containerSize}
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      className={`media-marker ${media.isVideo ? 'media-marker-video' : ''}`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--divelog-card-background)',
                        opacity: 'var(--markers-opacity, 0)',
                        border: media.isVideo ? '2px solid white' : 'none',
                        pointerEvents: 'none',
                      }}
                    >
                    {media.isVideo ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <MediaImage
                          thumbnailUrl={media.thumbnailUrl}
                          failedThumbnails={failedThumbnailsRef.current}
                          onThumbnailError={onThumbnailErrorRef.current}
                        />
                        {!failedThumbnailsRef.current.current.has(media.thumbnailUrl) && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              pointerEvents: 'none',
                            }}
                          >
                            <Play size={12} style={{ color: 'var(--divelog-foreground)', opacity: 0.5 }} />
                          </div>
                        )}
                      </div>
                    ) : media.isImage ? (
                      <MediaImage
                        thumbnailUrl={media.thumbnailUrl}
                        failedThumbnails={failedThumbnailsRef.current}
                        onThumbnailError={onThumbnailErrorRef.current}
                      />
                    ) : null}
                  </div>
                </div>
              </foreignObject>
            );
          })}
        </g>
      </>
    );
  }, []);

  // Use refs to track diveMedia to avoid re-creating handlers
  const diveMediaRef = useRef(diveMedia);
  useEffect(() => {
    diveMediaRef.current = diveMedia;
  }, [diveMedia]);

  // Throttle state updates to prevent flickering during touch events
  const updateHoveredIndex = useCallback((index: number | null) => {
    if (index !== currentHoveredIndexRef.current) {
      currentHoveredIndexRef.current = index;
      setHoveredMediaIndex(index);
    }
  }, [setHoveredMediaIndex]);

  const findClosestMediaIndex = useCallback((clientX: number) => {
    if (!xAxisScaleRef.current || !chartContainerRef.current || diveMediaRef.current.length === 0) return null;

    const rect = chartContainerRef.current.getBoundingClientRect();
    const adjustedX = clientX - rect.left;
    const scale = xAxisScaleRef.current;

    let minDistance = Infinity;
    let bestIndex: number | null = null;

    for (let i = 0; i < diveMediaRef.current.length; i++) {
      const mediaTime = diveMediaRef.current[i].chartTime;
      const mediaX = scale(mediaTime);
      const distance = Math.abs(mediaX - adjustedX);

      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = i;
      }
    }

    return bestIndex;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bestIndex = findClosestMediaIndex(e.clientX);
    if (bestIndex !== null) {
      updateHoveredIndex(bestIndex);
    }
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleMouseLeave = useCallback(() => {
    updateHoveredIndex(null);
  }, [updateHoveredIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(true);
    const touch = e.touches[0];
    if (!touch) return;
    const bestIndex = findClosestMediaIndex(touch.clientX);
    if (bestIndex !== null) {
      updateHoveredIndex(bestIndex);
    }
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const bestIndex = findClosestMediaIndex(touch.clientX);
    if (bestIndex !== null) {
      updateHoveredIndex(bestIndex);
    }
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    updateHoveredIndex(null);
  }, [updateHoveredIndex]);

  const handleTouchCancel = useCallback(() => {
    setIsTouching(false);
    updateHoveredIndex(null);
  }, [updateHoveredIndex]);

  // Prevent text selection and default click behavior
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div
      ref={chartContainerRef}
      className="h-64 w-full overflow-visible"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', '--markers-opacity': 0 } as React.CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <ResponsiveContainer width="100%" height={256}>
        <LineChart
          data={chartData}
          margin={{
            top: isMobile ? 50 : 60,
            right: isMobile ? 10 : 30,
            bottom: isMobile ? 10 : 20,
            left: isMobile ? -25 : 0,
          }}
          syncId={undefined}
        >
          <defs>
            {isNightDive ? (
              <linearGradient id={`waterGradient-${diveNumber}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 0% 0% / 0)" />
                <stop offset="100%" stopColor="hsl(0 0% 10% / 0.8)" />
              </linearGradient>
            ) : (
              <linearGradient id={`waterGradient-${diveNumber}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 0% 0% / 0)" />
                <stop offset="100%" stopColor="hsl(220 80% 15% / 0.6)" />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid
            className="stroke-transparent"
            fill={`url(#waterGradient-${diveNumber})`}
            fillOpacity={1}
          />
          <XAxis
            dataKey="time"
            type="number"
            domain={[minChartTime, maxChartTime]}
            allowDataOverflow={true}
            tickFormatter={(value) => {
              const totalSeconds = value
              const minutes = Math.floor(totalSeconds / 60)
              return minutes > 0 ? `${minutes}:00` : "";
            }}
            ticks={(() => {
              const ticks: number[] = []
              // Start from the nearest 5-minute mark before minChartTime, or 0 if minChartTime is positive
              const startTime = Math.max(0, Math.floor(minChartTime / 300) * 300)
              for (let seconds = startTime; seconds <= maxChartTime; seconds += 300) { // Every 5 minutes (300 seconds)
                ticks.push(seconds)
              }
              return ticks
            })()}
            className="text-xs"
          />
          <YAxis
            tickFormatter={(value) => `${value}m`}
            className="text-xs"
            reversed
          />
          <Customized component={MediaMarkers} />
          {shouldExtendBefore && (
            <Line
              data={extendedDataBefore}
              type="monotone"
              dataKey="depth"
              stroke="var(--divelog-muted-foreground)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              animationDuration={0}
            />
          )}
          {shouldExtendAfter && (
            <Line
              data={extendedDataAfter}
              type="monotone"
              dataKey="depth"
              stroke="var(--divelog-muted-foreground)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              animationDuration={0}
            />
          )}
          {/* Render base line last so its active dot stays above extension lines */}
          <Line
            data={baseChartData}
            type="monotone"
            dataKey="depth"
            stroke={isNightDive ? "var(--divelog-muted-foreground)" : "var(--divelog-highlight)"}
            strokeWidth={2}
            dot={false}
            activeDot={isMobile && !isTouching ? false : ActiveDot}
            isAnimationActive={false}
            animationDuration={0}
          />
          {/* Tooltip/cursor must be last so it draws above markers + lines */}
          <RechartsTooltip
            isAnimationActive={false}
            animationDuration={0}
            offset={50}
            cursor={isMobile && !isTouching ? false : true}
            content={({ active, payload, label }) => {
              // Hide tooltip on mobile when touch has ended (even if Recharts thinks it's active)
              if (isMobile && !isTouching) return null;
              if (!active || !payload || !payload.length) return null;
              const depth = payload[0].value as number;
              const totalSeconds = label as number;

              // Calculate actual time from dive start + time offset
              // diveStartTime is UTC-based, so we use UTC methods and display as local time
              const tooltipTime = new Date(diveStartTime + totalSeconds * 1000);
              // Get UTC time and display it directly (since dive times are stored as local time values)
              const utcHours = tooltipTime.getUTCHours();
              const utcMinutes = tooltipTime.getUTCMinutes();
              // For display, treat UTC time as if it were local time (since dive times are in local timezone)
              const timeHours = utcHours;
              const timeMinutes = utcMinutes;
              const ampm = timeHours >= 12 ? 'pm' : 'am';
              const displayHours = timeHours % 12 || 12;
              const formattedTime = `${displayHours}:${timeMinutes.toString().padStart(2, '0')}${ampm}`;

              // Format duration (time offset)
              const durationMinutes = Math.floor(totalSeconds / 60);
              const durationSeconds = Math.floor(totalSeconds % 60);
              const durationStr = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

              return (
                <div
                  style={{
                    backgroundColor: "var(--divelog-card-background)",
                    border: "1px solid var(--divelog-card-border)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                    textAlign: "left",
                    position: "relative",
                    zIndex: 1000,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ArrowDownFromLine size={14} style={{ color: 'var(--divelog-foreground)', flexShrink: 0 }} />
                    <span>{depth.toFixed(1)}m</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Timer size={14} style={{ color: 'var(--divelog-foreground)', flexShrink: 0 }} />
                    <span>{durationStr}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Clock size={14} style={{ color: 'var(--divelog-foreground)', flexShrink: 0 }} />
                    <span>{formattedTime}</span>
                  </div>
                </div>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
})
