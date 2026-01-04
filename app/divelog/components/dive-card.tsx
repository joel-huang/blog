"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import NextImage from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/divelog/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/divelog/components/ui/tooltip"
import { Dialog, DialogContent } from "@/app/divelog/components/ui/dialog"
import { DemoDialog } from "@/app/divelog/components/demo-dialog"
import { Dive } from "@/app/divelog/utils/parseDives"
import { MediaFile } from "@/app/divelog/utils/mediaTypes"
import { useIsMobile } from "@/app/divelog/hooks/use-mobile"
import { DiveChart, ProcessedMedia } from "./dive-chart"
import { DiveCarousel } from "./dive-carousel"
import { ArrowDownFromLine, Timer, Moon, X, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/app/divelog/components/ui/button"

interface DiveCardProps {
  dive: Dive
  mediaFiles?: MediaFile[]
}

const EMPTY_MEDIA_FILES: MediaFile[] = []

// Reusable diver avatar + name component
function DiverAvatar({
  diver,
  onClick
}: {
  diver: { name: string; avatar: string; color: string };
  onClick?: () => void;
}) {
  // Only show profile image for Joel Huang (main diver)
  const isMainDiver = diver.name === "Joel Huang";

  const content = (
    <>
      <Avatar size="sm">
        {isMainDiver && <AvatarImage src="/profile.jpg" alt={diver.name} />}
        <AvatarFallback className={diver.color}>
          <span className="text-xs font-medium text-divelog-foreground hover:text-divelog-primary-foreground">
            {diver.avatar}
          </span>
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-divelog-foreground hover:text-divelog-primary-foreground">{diver.name}</span>
    </>
  );

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2"
    >
      {content}
    </button>
  );
}

// Mock diver data - in a real app, this would come from a database
const divers = [
  { name: "Joel Huang", avatar: "J", color: "bg-blue-500" },
  { name: "Isaac Chong", avatar: "I", color: "bg-gray-500" },
  { name: "Adrian Ngadi", avatar: "A", color: "bg-gray-600" },
  { name: "Wei Shi Ang", avatar: "W", color: "bg-gray-700" },
  { name: "Tik Khawranong", avatar: "T", color: "bg-gray-800" },
]

// Mock dive sites - in a real app, this would come from the data
const diveSites = [
  { site: "Mirko's Reef", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "Meno Wall", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "Shark Point", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "Halik", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "Bounty Wreck", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "Biorocks", location: "Gili Trawangan", country: "Indonesia", divers: [0, 1] },
  { site: "SD Point", location: "Nusa Penida", country: "Indonesia", divers: [0, 1] },
  { site: "Suana", location: "Nusa Penida", country: "Indonesia", divers: [0, 1] },
  { site: "Dan's Reef", location: "Nusa Penida", country: "Indonesia", divers: [0, 1] },
  { site: "Crystal Bay", location: "Nusa Penida", country: "Indonesia", divers: [0, 1] },
  { site: "Sental", location: "Nusa Penida", country: "Indonesia", divers: [0, 1] },
  { site: "Hideaway Bay", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Deep Six", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Similan Island 9", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Turtle Rock", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "West Ridge", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Ko Tachai Pinnacle", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "North Reef", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Richelieu Rock", location: "Surin Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Richelieu Rock", location: "Surin Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Richelieu Rock", location: "Surin Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Richelieu Rock", location: "Surin Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "The Bay", location: "Similan Islands", country: "Thailand", divers: [0, 1, 2, 3, 4] },
  { site: "Boonsung Wreck", location: "Khao Lak", country: "Thailand", divers: [0, 1, 2, 3, 4] },
]

// Parse time string like "12:30" (MM:SS format) to total seconds
function parseTimeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

export function DiveCard({ dive, mediaFiles = EMPTY_MEDIA_FILES }: DiveCardProps) {
  const isMobile = useIsMobile()
  // Track if component has mounted to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  // State for tracking which media marker is hovered
  const [hoveredMediaIndex, setHoveredMediaIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  // State for lightbox (which image/video is open)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMediaIndex, setLightboxMediaIndex] = useState<number | null>(null);
  // State for CTA modal
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  // Track which thumbnails have failed to load (persists across re-renders)
  const failedThumbnails = useRef<Set<string>>(new Set());
  const onThumbnailError = useCallback((url: string) => {
    failedThumbnails.current.add(url);
  }, []);

  // Get divers for this dive based on the dive site
  const diveSite = diveSites[dive.diveNumber - 1]
  const selectedDivers = diveSite.divers.map(index => divers[index])

  const dateTime = useMemo(() => {
    // Parse date and time - use UTC for consistency between server and client
    // Parse date string (format: "YYYY-MM-DD") and time string (format: "HH:MM")
    const [year, month, day] = dive.date.split('-').map(Number)
    const [hours, mins] = dive.time.split(':').map(Number)
    // Create date using UTC for consistent calculations (prevents hydration mismatches)
    return new Date(Date.UTC(year, month - 1, day, hours, mins))
  }, [dive.date, dive.time])

  // Format date using UTC (consistent)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const formattedDate = `${monthNames[dateTime.getUTCMonth()]} ${dateTime.getUTCDate()}`

  // For display, use the original time values to show correct time (dive times are stored as local time)
  // Format time directly from the original time string to avoid timezone conversion issues
  const [timeHours, timeMinutes] = useMemo(() => {
    const [hours, mins] = dive.time.split(':').map(Number)
    return [hours, mins] as const
  }, [dive.time])
  const ampm = timeHours >= 12 ? 'pm' : 'am'
  const displayHours = timeHours % 12 || 12
  const formattedTime = `${displayHours}:${timeMinutes.toString().padStart(2, '0')} ${ampm}`

  // Check if it's a night dive (after 5pm) using original time values
  const isNightDive = timeHours >= 17

  const {
    baseChartData,
    diveStartTime,
    minDiveTime,
    maxDiveTime,
    shouldExtendAfter,
    shouldExtendBefore,
    minChartTime,
    maxChartTime,
    extendedDataAfter,
    extendedDataBefore,
    chartData,
    diveMedia,
  } = useMemo(() => {
    // Prepare chart data
    const baseChartData = dive.samples.map(sample => ({
      time: parseTimeToSeconds(sample.sampleTime),
      depth: sample.depth,
    }))

    // Match media files to this dive and calculate time offsets
    // Add 10 minute offset - dive time data source is 10 mins ahead
    // dateTime is UTC-based, so getTime() gives us a consistent timestamp
    const diveStartTime = dateTime.getTime() - 10 * 60 * 1000
    const minDiveTime = Math.min(...baseChartData.map(d => d.time))
    const maxDiveTime = Math.max(...baseChartData.map(d => d.time))
    const diveEndTime = diveStartTime + maxDiveTime * 1000
    const startEndBuffer = 300 // 5 minutes

    // Check if there are any media files in the extended 3-minute window AFTER the dive
    const potentialExtendedMedia = mediaFiles.filter(media => {
      const mediaTime = media.timestamp.getTime()
      const mediaDate = new Date(media.timestamp)
      // Compare dates using UTC methods (both dive and media timestamps are UTC-based)
      const sameDate = mediaDate.getUTCFullYear() === dateTime.getUTCFullYear() &&
        mediaDate.getUTCMonth() === dateTime.getUTCMonth() &&
        mediaDate.getUTCDate() === dateTime.getUTCDate()

      if (!sameDate) return false

      // Check if media is within the extended 3-minute window after dive
      const timeOffsetSeconds = Math.max(0, (mediaTime - diveStartTime) / 1000)
      return timeOffsetSeconds > maxDiveTime && timeOffsetSeconds <= maxDiveTime + startEndBuffer
    })

    // Check if there are any media files in the extended 3-minute window BEFORE the dive
    const potentialPreExtendedMedia = mediaFiles.filter(media => {
      const mediaTime = media.timestamp.getTime()
      const mediaDate = new Date(media.timestamp)
      // Compare dates using UTC methods (both dive and media timestamps are UTC-based)
      const sameDate = mediaDate.getUTCFullYear() === dateTime.getUTCFullYear() &&
        mediaDate.getUTCMonth() === dateTime.getUTCMonth() &&
        mediaDate.getUTCDate() === dateTime.getUTCDate()

      if (!sameDate) return false

      // Check if media is within the extended 3-minute window before dive
      const timeOffsetSeconds = (mediaTime - diveStartTime) / 1000
      return timeOffsetSeconds < minDiveTime && timeOffsetSeconds >= minDiveTime - startEndBuffer
    })

    // Only extend chart if there are media files in the extended windows
    const shouldExtendAfter = potentialExtendedMedia.length > 0
    const shouldExtendBefore = potentialPreExtendedMedia.length > 0
    // Always include the full dive range, extend if there's media in extended windows
    const minChartTime = shouldExtendBefore ? minDiveTime - startEndBuffer : minDiveTime
    const maxChartTime = shouldExtendAfter ? maxDiveTime + startEndBuffer : maxDiveTime

    // Get the first and last dive points to connect the extended lines
    const firstDivePoint = baseChartData[0]
    const lastDivePoint = baseChartData[baseChartData.length - 1]

    // Extended data for the grayscale portion AFTER (from last dive point to surface)
    // Generate points at 5-second intervals
    const extendedDataAfter = shouldExtendAfter ? (() => {
      const points: Array<{ time: number; depth: number }> = [lastDivePoint]
      const interval = 5 // 5 seconds
      let currentTime = lastDivePoint.time + interval

      while (currentTime <= maxChartTime) {
        points.push({ time: currentTime, depth: 0 })
        currentTime += interval
      }

      // Ensure we end at exactly maxChartTime
      if (points[points.length - 1].time < maxChartTime) {
        points.push({ time: maxChartTime, depth: 0 })
      }

      return points
    })() : []

    // Extended data for the grayscale portion BEFORE (from surface to first dive point)
    // Generate points at 5-second intervals
    const extendedDataBefore = shouldExtendBefore ? (() => {
      const points: Array<{ time: number; depth: number }> = []
      const interval = 5 // 5 seconds
      let currentTime = minChartTime

      while (currentTime < firstDivePoint.time) {
        points.push({ time: currentTime, depth: 0 })
        currentTime += interval
      }

      // Ensure we connect to the first dive point
      points.push(firstDivePoint)

      return points
    })() : []

    // Full chart data for domain calculation
    const chartData = [
      ...(shouldExtendBefore ? [{ time: minChartTime, depth: 0 }] : []),
      ...baseChartData,
      ...(shouldExtendAfter ? [{ time: maxChartTime, depth: 0 }] : [])
    ]

    const diveMedia = mediaFiles
      .filter(media => {
        const mediaTime = media.timestamp.getTime()
        const mediaDate = new Date(media.timestamp)
        // Compare dates using UTC methods (both dive and media timestamps are UTC-based)
        const sameDate = mediaDate.getUTCFullYear() === dateTime.getUTCFullYear() &&
          mediaDate.getUTCMonth() === dateTime.getUTCMonth() &&
          mediaDate.getUTCDate() === dateTime.getUTCDate()

        if (!sameDate) return false

        // Media should be within 2 hours before dive start and during/after dive (including extended 5 min window)
        return mediaTime >= diveStartTime - 2 * 60 * 60 * 1000 && mediaTime <= diveEndTime + 30 * 60 * 1000
      })
      .map(media => {
        const mediaTimestamp = media.timestamp.getTime()
        // Calculate time offset from dive start in seconds (can be negative for pre-dive media)
        const timeOffsetSeconds = (mediaTimestamp - diveStartTime) / 1000

        // Handle media in different time ranges
        let chartTime: number
        let depth: number

        if (timeOffsetSeconds > maxDiveTime && timeOffsetSeconds <= maxChartTime) {
          // Media is in the extended 3-minute window AFTER dive
          chartTime = timeOffsetSeconds
          // Use surface depth (0) for media after dive ends
          depth = 0
        } else if (timeOffsetSeconds < minDiveTime && timeOffsetSeconds >= minChartTime) {
          // Media is in the extended 3-minute window BEFORE dive
          chartTime = timeOffsetSeconds
          // Use surface depth (0) for media before dive starts
          depth = 0
        } else if (timeOffsetSeconds >= minDiveTime && timeOffsetSeconds <= maxDiveTime) {
          // Media is during the dive - find nearest x value in chart data
          const nearestTime = baseChartData.reduce((prev, curr) =>
            Math.abs(curr.time - timeOffsetSeconds) < Math.abs(prev.time - timeOffsetSeconds) ? curr : prev
          )
          chartTime = nearestTime.time
          depth = nearestTime.depth
        } else {
          // Media is outside the extended windows - exclude it
          // This prevents media from hours before/after from appearing on the chart
          return null as any
        }

        // Calculate and format time of day once
        // diveStartTime is UTC-based, so we use UTC methods and then display as local time
        const mediaDateTime = new Date(diveStartTime + timeOffsetSeconds * 1000);
        // Get UTC time and display it directly (since dive times are stored as local time values)
        const utcHours = mediaDateTime.getUTCHours();
        const utcMinutes = mediaDateTime.getUTCMinutes();
        // For display, treat UTC time as if it were local time (since dive times are in local timezone)
        const timeHours = utcHours;
        const timeMinutes = utcMinutes;
        const ampm = timeHours >= 12 ? 'pm' : 'am';
        const displayHours = timeHours % 12 || 12;
        const formattedTime = `${displayHours}:${timeMinutes.toString().padStart(2, '0')}${ampm}`;

        return {
          ...media,
          timeOffset: timeOffsetSeconds,
          chartTime,
          depth,
          formattedTime,
        } as ProcessedMedia
      })
      .filter((media): media is ProcessedMedia => {
        // Filter out null values (media outside valid time windows)
        if (!media) return false
        // Only show media within the chart domain to ensure it renders correctly
        // The chart domain is [minChartTime, maxChartTime], so all media must be within this range
        // Use a small epsilon to account for floating point precision
        const epsilon = 0.1
        return media.chartTime >= minChartTime - epsilon && media.chartTime <= maxChartTime + epsilon
      })

    return {
      baseChartData,
      diveStartTime,
      minDiveTime,
      maxDiveTime,
      shouldExtendAfter,
      shouldExtendBefore,
      minChartTime,
      maxChartTime,
      extendedDataAfter,
      extendedDataBefore,
      chartData,
      diveMedia,
    }
  }, [dive.samples, mediaFiles, dateTime])

  // Format duration for display (duration is in MM:SS format)
  const [minutes, seconds] = dive.duration.split(':').map(Number)
  const totalMinutes = minutes
  const durationDisplay = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : totalMinutes > 0
      ? `${totalMinutes}m ${seconds}s`
      : `${seconds}s`

  // Generate anchor ID: title-kebab-case-yyyymmdd-hhmm
  const titleKebab = diveSite.site
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const dateStr = dateTime.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const timeStr = `${timeHours.toString().padStart(2, '0')}${timeMinutes.toString().padStart(2, '0')}` // HHMM
  const anchorId = `${titleKebab}-${dateStr}-${timeStr}`

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1500);
  }, []);

  const copyAnchorLink = useCallback(async () => {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "";
    const urlToCopy = `${baseUrl}#${anchorId}`;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      showToast("Copied link");
      return;
    } catch {
      // Fallback for older browsers / denied clipboard permissions
      try {
        const ta = document.createElement("textarea");
        ta.value = urlToCopy;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Copied link");
      } catch {
        showToast("Couldn't copy");
      }
    }
  }, [anchorId, showToast]);

  // Set mounted state after hydration to prevent mismatches
  useEffect(() => {
    setMounted(true);
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div id={anchorId} className="rounded-lg bg-divelog-card-background border border-divelog-card-border p-4 pt-3 sm:p-6 shadow-sm">
      {/* Post Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-divelog-card-border/50 pb-3">
        <div className="flex items-center gap-1 flex-wrap">
          <DiverAvatar
            diver={selectedDivers[0]}
            onClick={() => setCtaModalOpen(true)}
          />

          <div className="flex items-center gap-1">
            <span className="text-sm text-divelog-muted-foreground">with</span>

            {selectedDivers.length === 2 ? (
              <DiverAvatar diver={selectedDivers[1]} onClick={() => setCtaModalOpen(true)} />
            ) : selectedDivers.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium underline decoration-dotted">
                    {selectedDivers.length - 1} others
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="bg-divelog-card-background border border-divelog-card-border text-divelog-foreground"
                  sideOffset={8}
                  hideArrow
                >
                  <div className="flex flex-col gap-2 text-left">
                    {selectedDivers.slice(1).map((diver, index) => (
                      <DiverAvatar key={index} diver={diver} onClick={() => setCtaModalOpen(true)} />
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
        <div className="flex items-center text-left sm:text-right text-sm text-divelog-muted-foreground">
          <div>{formattedDate} at {formattedTime}</div>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2">
        <h3 className="text-2xl font-semibold">
          {diveSite.site}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void copyAnchorLink();
          }}
          aria-label="Copy link to this dive"
          className="text-divelog-muted-foreground hover:text-divelog-foreground"
        >
          <LinkIcon className="size-4" />
        </Button>
        {isNightDive && (
          <Moon size={20} className="text-divelog-foreground" />
        )}
      </div>
      <p className="mb-4 text-sm text-divelog-muted-foreground">
        {diveSite.location}, {diveSite.country}
      </p>

      {/* Stats */}
      <div className="mb-4 flex gap-6">
        <div>
          <div className="flex items-center gap-1 text-sm text-divelog-muted-foreground">
            <ArrowDownFromLine size={10} />
            <span className="text-xs">Max. Depth</span>
          </div>
          <div className="text-lg font-semibold">{dive.maxDepth.toFixed(1)} m</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-sm text-divelog-muted-foreground">
            <Timer size={10} />
            <span className="text-xs">Duration</span>
          </div>
          <div className="text-lg font-semibold">{durationDisplay}</div>
        </div>
      </div>

      {/* Photo Carousel - Show first on mobile for better thumb control */}
      {mounted && isMobile && (
        <DiveCarousel
          diveMedia={diveMedia}
          hoveredMediaIndex={hoveredMediaIndex}
          className="mb-4 w-full whitespace-nowrap"
          mainDiver={selectedDivers[0]}
          failedThumbnails={failedThumbnails}
          onThumbnailError={onThumbnailError}
          onThumbnailClick={(index) => {
            setLightboxMediaIndex(index);
            setLightboxOpen(true);
          }}
        />
      )}

      {/* Dive Depth Chart */}
      <DiveChart
        diveNumber={dive.diveNumber}
        chartData={chartData}
        baseChartData={baseChartData}
        extendedDataBefore={extendedDataBefore}
        extendedDataAfter={extendedDataAfter}
        minChartTime={minChartTime}
        maxChartTime={maxChartTime}
        shouldExtendBefore={shouldExtendBefore}
        shouldExtendAfter={shouldExtendAfter}
        isNightDive={isNightDive}
        diveMedia={diveMedia}
        setHoveredMediaIndex={setHoveredMediaIndex}
        diveStartTime={diveStartTime}
        failedThumbnails={failedThumbnails}
        onThumbnailError={onThumbnailError}
      />

      {/* Photo Carousel - Show after chart on desktop */}
      {(!mounted || !isMobile) && (
        <DiveCarousel
          diveMedia={diveMedia}
          hoveredMediaIndex={hoveredMediaIndex}
          className="mt-4 w-full whitespace-nowrap"
          mainDiver={selectedDivers[0]}
          failedThumbnails={failedThumbnails}
          onThumbnailError={onThumbnailError}
          onThumbnailClick={(index) => {
            setLightboxMediaIndex(index);
            setLightboxOpen(true);
          }}
        />
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="!p-0 !gap-0 bg-black/95 border-none max-w-[95vw] max-h-[95vh] [&>div>button]:hidden [&>div]:!p-0"
          style={{
            display: 'inline-block',
            width: 'auto',
            height: 'auto',
            padding: 0,
            gap: 0
          }}
        >
          {lightboxMediaIndex !== null && diveMedia[lightboxMediaIndex] && (
            <div className="relative inline-block max-w-[95vw] max-h-[95vh]">
              {diveMedia[lightboxMediaIndex].isImage ? (
                <img
                  src={diveMedia[lightboxMediaIndex].blobUrl}
                  alt=""
                  style={{
                    maxWidth: '95vw',
                    maxHeight: '95vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : diveMedia[lightboxMediaIndex].isVideo ? (
                <video
                  src={diveMedia[lightboxMediaIndex].blobUrl}
                  controls
                  autoPlay
                  style={{
                    maxWidth: '95vw',
                    maxHeight: '95vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : null}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-2 right-2 z-50 text-white opacity-70 hover:opacity-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CTA Modal */}
      <DemoDialog open={ctaModalOpen} onOpenChange={setCtaModalOpen} />

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 20,
            transform: "translateX(-50%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--divelog-card-background)",
              border: "1px solid var(--divelog-card-border)",
              borderRadius: "9999px",
              padding: "0.5rem 0.75rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              color: "var(--divelog-foreground)",
              fontSize: 14,
            }}
          >
            <Check className="size-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
