"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import Image from "next/image";
import React from "react";

const CraiyonExamples: React.FC = () => {
  const data = [
    {
      caption: "lofi nuclear war to relax and study to",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/lofi.webp",
    },
    {
      caption: "reddit mod touching grass",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/reddit-mod.webp",
    },
    {
      caption: "Moai statue giving a TED talk",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/tedtalk.webp",
    },
    {
      caption: "stephen hawking in rocket league",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/hawking-rocket-league.webp",
    },
    {
      caption: "Margaret Thatcher meeting Satan",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/thatcher-satan.webp",
    },
    {
      caption: "gaming diaper",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/gaming-diaper.webp",
    },
    {
      caption: "Pixar Coronavirus movie",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/pixar-covid.webp",
    },
    {
      caption: "dashcam footage of a car crashing into shrek",
      src: "/blog/the-golden-hour-of-craiyon-dalle-mini/dashcam-shrek.webp",
    },
  ];
  return (
    <div className="w-full flex items-center justify-center">
      <Carousel className="max-w-sm p-2">
        <CarouselContent>
          {data.map((d, i) => (
            <CarouselItem
              key={i}
              className="flex flex-col items-center justify-center gap-2 select-none"
            >
              <span className="flex items-center gap-2">{d.caption}</span>
              <Image
                key={i}
                src={d.src}
                alt={d.caption}
                width={360}
                height={360}
                className="max-h-96"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:inline-flex" />
        <CarouselNext className="hidden sm:inline-flex" />
      </Carousel>
    </div>
  );
};

export default CraiyonExamples;
