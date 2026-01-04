"use client"

import { memo, useRef, useEffect, useCallback, useState } from "react"
import NextImage from "next/image"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Customized } from "recharts"
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
function ActiveDot({ cx, cy }: { cx: number; cy: number }) {
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
        {/* Use plain img to avoid Next/Image remount flicker during scrubbing */}
        <img
          src="/profile.jpg"
          alt=""
          width={24}
          height={24}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </foreignObject>
  );
}

type ActivePoint = {
  time: number;
  depth: number;
  x: number;
  y: number;
};

function formatDuration(totalSeconds: number) {
  const durationMinutes = Math.floor(totalSeconds / 60);
  const durationSeconds = Math.floor(totalSeconds % 60);
  return `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
}

function formatDiveTime(diveStartTime: number, totalSeconds: number) {
  const tooltipTime = new Date(diveStartTime + totalSeconds * 1000);
  const utcHours = tooltipTime.getUTCHours();
  const utcMinutes = tooltipTime.getUTCMinutes();
  const timeHours = utcHours;
  const timeMinutes = utcMinutes;
  const ampm = timeHours >= 12 ? 'pm' : 'am';
  const displayHours = timeHours % 12 || 12;
  return `${displayHours}:${timeMinutes.toString().padStart(2, '0')}${ampm}`;
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
  const xAxisScaleObjRef = useRef<any>(null);
  const yAxisScaleObjRef = useRef<any>(null);
  const scaleReadyRef = useRef(false);
  const currentHoveredIndexRef = useRef<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const [activePoint, setActivePoint] = useState<ActivePoint | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const latestClientXRef = useRef<number | null>(null);

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

  const baseChartDataRef = useRef(baseChartData);
  const baseTimesRef = useRef<number[]>([]);
  useEffect(() => {
    baseChartDataRef.current = baseChartData;
    baseTimesRef.current = baseChartData.map(d => d.time);
  }, [baseChartData]);

  // Throttle state updates to prevent flickering during touch events
  const updateHoveredIndex = useCallback((index: number | null) => {
    if (index !== currentHoveredIndexRef.current) {
      currentHoveredIndexRef.current = index;
      setHoveredMediaIndex(index);
    }
  }, [setHoveredMediaIndex]);

  const scheduleActiveUpdate = useCallback((clientX: number) => {
    latestClientXRef.current = clientX;
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const latest = latestClientXRef.current;
      if (latest === null) return;
      if (!chartContainerRef.current) return;
      const xScale: any = xAxisScaleObjRef.current;
      const yScale: any = yAxisScaleObjRef.current;
      if (!xScale || !yScale) return;

      const rect = chartContainerRef.current.getBoundingClientRect();
      const adjustedX = latest - rect.left;

      const data = baseChartDataRef.current;
      const times = baseTimesRef.current;
      if (!data.length || !times.length) return;

      const findNearestIndexByTime = (t: number) => {
        let lo = 0;
        let hi = times.length - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const v = times[mid];
          if (v === t) return mid;
          if (v < t) lo = mid + 1;
          else hi = mid - 1;
        }
        // lo is insertion point; compare lo and lo-1
        const a = Math.max(0, Math.min(times.length - 1, lo));
        const b = Math.max(0, a - 1);
        return Math.abs(times[a] - t) < Math.abs(times[b] - t) ? a : b;
      };

      let nearestIndex = 0;
      if (typeof xScale.invert === 'function') {
        const t = xScale.invert(adjustedX);
        nearestIndex = findNearestIndexByTime(t);
      } else {
        // Fallback: compare pixel distances directly
        let bestDist = Infinity;
        let bestIdx = 0;
        for (let i = 0; i < data.length; i++) {
          const px = xScale(data[i].time);
          const dist = Math.abs(px - adjustedX);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        nearestIndex = bestIdx;
      }

      if (activeIndexRef.current === nearestIndex) return;
      activeIndexRef.current = nearestIndex;

      const pt = data[nearestIndex];
      const x = xScale(pt.time);
      const y = yScale(pt.depth);
      if (typeof x !== 'number' || typeof y !== 'number' || Number.isNaN(x) || Number.isNaN(y)) return;

      setActivePoint({ time: pt.time, depth: pt.depth, x, y });
    });
  }, []);

  const clearActive = useCallback(() => {
    latestClientXRef.current = null;
    activeIndexRef.current = null;
    setActivePoint(null);
  }, []);

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
    scheduleActiveUpdate(e.clientX);
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleMouseLeave = useCallback(() => {
    updateHoveredIndex(null);
    clearActive();
  }, [updateHoveredIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setIsTouching(true);
    const touch = e.touches[0];
    if (!touch) return;
    const bestIndex = findClosestMediaIndex(touch.clientX);
    if (bestIndex !== null) {
      updateHoveredIndex(bestIndex);
    }
    scheduleActiveUpdate(touch.clientX);
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const bestIndex = findClosestMediaIndex(touch.clientX);
    if (bestIndex !== null) {
      updateHoveredIndex(bestIndex);
    }
    scheduleActiveUpdate(touch.clientX);
  }, [findClosestMediaIndex, updateHoveredIndex]);

  const handleTouchEnd = useCallback(() => {
    setIsTouching(false);
    updateHoveredIndex(null);
    clearActive();
  }, [updateHoveredIndex]);

  const handleTouchCancel = useCallback(() => {
    setIsTouching(false);
    updateHoveredIndex(null);
    clearActive();
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
            activeDot={false}
            isAnimationActive={false}
            animationDuration={0}
          />
          <Customized
            component={(props: any) => {
              const { xAxisMap, yAxisMap, width, height } = props;
              const xAxis = xAxisMap ? (Object.values(xAxisMap)[0] as any) : null;
              const yAxis = yAxisMap ? (Object.values(yAxisMap)[0] as any) : null;
              if (xAxis?.scale) {
                xAxisScaleObjRef.current = xAxis.scale;
              }
              if (yAxis?.scale) {
                yAxisScaleObjRef.current = yAxis.scale;
              }

              // Only show cursor/dot/tooltip while interacting (touch) or hovering (desktop).
              const show = !!activePoint && (!isMobile || isTouching);
              if (!show || !activePoint) return null;

              const svgW = typeof width === 'number' ? width : 0;
              const svgH = typeof height === 'number' ? height : 0;

              const tooltipW = 150;
              const tooltipH = 96;
              const pad = 12;

              const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
              const tx = clamp(activePoint.x - tooltipW - pad, 0, Math.max(0, svgW - tooltipW));
              const ty = clamp(activePoint.y - tooltipH - pad, 0, Math.max(0, svgH - tooltipH));

              const durationStr = formatDuration(activePoint.time);
              const formattedTime = formatDiveTime(diveStartTime, activePoint.time);

              return (
                <g style={{ pointerEvents: 'none' }}>
                  {/* cursor line behind dot */}
                  <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1={0}
                    y2={svgH}
                    stroke="rgba(255,255,255,0.65)"
                    strokeWidth={1}
                  />
                  {/* avatar dot above cursor line */}
                  <ActiveDot cx={activePoint.x} cy={activePoint.y} />
                  {/* tooltip above everything */}
                  <foreignObject x={tx} y={ty} width={tooltipW} height={tooltipH}>
                    <div
                      style={{
                        backgroundColor: "var(--divelog-card-background)",
                        border: "1px solid var(--divelog-card-border)",
                        borderRadius: "0.5rem",
                        padding: "0.5rem",
                        textAlign: "left",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ArrowDownFromLine size={14} style={{ color: 'var(--divelog-foreground)', flexShrink: 0 }} />
                        <span>{activePoint.depth.toFixed(1)}m</span>
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
                  </foreignObject>
                </g>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
})
