"use client"

import { useRef, useEffect } from "react"
import NextImage from "next/image"
import { ScrollArea, ScrollBar } from "@/app/divelog/components/ui/scroll-area"
import { Film, Image, Play } from "lucide-react"
import { ProcessedMedia } from "./dive-chart"

interface DiveCarouselProps {
  diveMedia: ProcessedMedia[]
  hoveredMediaIndex: number | null
  className?: string
  mainDiver: { name: string; avatar: string; color: string }
  failedThumbnails: React.MutableRefObject<Set<string>>
  onThumbnailError: (url: string) => void
  onThumbnailClick: (index: number) => void
}

// Carousel thumbnail component
function CarouselThumbnail({
  media,
  onClick,
  failedThumbnails,
  onThumbnailError,
  mainDiver
}: {
  media: ProcessedMedia;
  onClick?: () => void;
  failedThumbnails: React.MutableRefObject<Set<string>>;
  onThumbnailError: (url: string) => void;
  mainDiver: { name: string; avatar: string; color: string };
}) {
  const hasFailed = failedThumbnails.current.has(media.thumbnailUrl);

  // Format elapsed duration from timeOffset (seconds) to MM:SS
  const formatElapsedDuration = (timeOffsetSeconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(timeOffsetSeconds));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Always show MM:SS format
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const elapsedDuration = formatElapsedDuration(media.timeOffset);

  // Log metadata on hover
  const handleMouseEnter = () => {
    console.log('Carousel Media Metadata:', {
      blobUrl: media.blobUrl,
      thumbnailUrl: media.thumbnailUrl,
      timestamp: media.timestamp,
      isImage: media.isImage,
      isVideo: media.isVideo,
      timeOffset: media.timeOffset,
      chartTime: media.chartTime,
      depth: media.depth,
      formattedTime: media.formattedTime
    });
  };

  if (media.isVideo) {
    if (hasFailed) {
      return (
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-md border border-divelog-card-border bg-divelog-card-background"
          style={{
            height: '240px',
            minWidth: '200px',
            aspectRatio: '16/9',
          }}
        >
          <Film size={24} style={{ color: 'var(--divelog-foreground)' }} />
        </div>
      );
    }

    return (
      <div
        className="relative overflow-hidden rounded-md"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: 'none' }}
      >
        <img
          src={media.thumbnailUrl}
          alt=""
          style={{
            height: '240px',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'contain',
            display: 'block',
          }}
          loading="lazy"
          onError={() => {
            onThumbnailError(media.thumbnailUrl);
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <Play size={32} style={{ color: 'var(--divelog-foreground)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
        </div>
        <div
          className="absolute bottom-0 right-0 px-1.5 py-0.5 flex items-center gap-1.5 text-xs bg-black/70 text-white rounded-tl-md"
          style={{
            fontSize: '0.625rem',
            lineHeight: '1rem',
          }}
        >
          <span>{elapsedDuration}</span>
        </div>
      </div>
    );
  }

  if (media.isImage) {
    if (hasFailed) {
      return (
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-md border border-divelog-card-border bg-divelog-card-background"
          style={{
            height: '240px',
            minWidth: '200px',
          }}
        >
          <Image size={24} style={{ color: 'var(--divelog-foreground)' }} />
        </div>
      );
    }

    return (
      <div
        className="relative overflow-hidden rounded-md"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: 'none' }}
      >
        <img
          src={media.thumbnailUrl}
          alt=""
          style={{
            height: '240px',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'contain',
            display: 'block',
          }}
          loading="lazy"
          onError={() => {
            onThumbnailError(media.thumbnailUrl);
          }}
        />
        <div
          className="absolute bottom-0 right-0 px-1.5 py-0.5 flex items-center gap-1.5 text-xs bg-black/70 text-white rounded-tl-md"
          style={{
            fontSize: '0.625rem',
            lineHeight: '1rem',
          }}
        >
          <span>{elapsedDuration}</span>
        </div>
      </div>
    );
  }

  return null;
}

export function DiveCarousel({
  diveMedia,
  hoveredMediaIndex,
  className = "",
  mainDiver,
  failedThumbnails,
  onThumbnailError,
  onThumbnailClick
}: DiveCarouselProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll carousel to corresponding thumbnail when hoveredMediaIndex changes
  useEffect(() => {
    if (hoveredMediaIndex !== null) {
      // Use requestAnimationFrame for immediate execution without delay
      const rafId = requestAnimationFrame(() => {
        const thumbnailElement = thumbnailRefs.current[hoveredMediaIndex];
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;

        if (thumbnailElement && scrollContainer) {
          // Calculate scroll position for faster, more direct scrolling
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = thumbnailElement.getBoundingClientRect();
          const scrollLeft = scrollContainer.scrollLeft;
          const elementLeft = elementRect.left - containerRect.left + scrollLeft;
          const elementWidth = elementRect.width;
          const containerWidth = containerRect.width;

          // Center the element in the viewport
          const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2);
          const startScroll = scrollLeft;
          const distance = targetScroll - startScroll;
          const duration = 150; // Faster animation: 150ms instead of default ~300-500ms
          const startTime = performance.now();

          // Custom smooth scroll animation with shorter duration
          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentScroll = startScroll + distance * easeOut;

            scrollContainer.scrollLeft = currentScroll;

            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);
        } else if (thumbnailElement) {
          // Fallback to scrollIntoView if ScrollArea structure is different
          thumbnailElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [hoveredMediaIndex]);

  if (diveMedia.length === 0) return null;

  return (
    <ScrollArea ref={scrollAreaRef} className={className}>
      <div
        ref={carouselRef}
        className="flex w-max space-x-1"
      >
        {diveMedia.map((media, index) => (
          <div
            key={`${index}-${media.blobUrl}`}
            ref={(el) => {
              thumbnailRefs.current[index] = el;
            }}
            className="shrink-0"
          >
            <CarouselThumbnail
              media={media}
              mainDiver={mainDiver}
              failedThumbnails={failedThumbnails}
              onThumbnailError={onThumbnailError}
              onClick={() => {
                if (media.isImage || media.isVideo) {
                  onThumbnailClick(index);
                }
              }}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
