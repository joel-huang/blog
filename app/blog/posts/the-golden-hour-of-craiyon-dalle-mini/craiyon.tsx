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
      src: "https://preview.redd.it/snl5ws2hbs791.png?auto=webp&s=d74fb1139bf7f7535d255bffdeb6d218e5f23b60",
    },
    {
      caption: "reddit mod touching grass",
      src: "https://preview.redd.it/erow3du7re591.jpg?auto=webp&s=5beb08556bc4eb42d566b8e03d5654b96f7b96a4",
    },
    {
      caption: "Moai statue giving a TED talk",
      src: "https://preview.redd.it/ousdsl7ugs491.jpg?auto=webp&s=2385640d3ee3cac625111b81a92f7c89bd268493",
    },
    {
      caption: "stephen hawking in rocket league",
      src: "https://preview.redd.it/k7w2ht5dn0591.png?auto=webp&s=875197b8bbc13eab9bfcfed8ec20606eea311824",
    },
    {
      caption: "Margaret Thatcher meeting Satan",
      src: "https://preview.redd.it/2xxk3gzjwl491.png?auto=webp&s=c7cd51307a4d3804e3f423687d2af33f927ce791",
    },
    {
      caption: "gaming diaper",
      src: "https://preview.redd.it/5n546naaet591.png?auto=webp&s=11a1617079fd74dfd3ef24a0ea1b7baae4f9b11c",
    },
    {
      caption: "Pixar Coronavirus movie",
      src: "https://preview.redd.it/fhdf8num4ed91.jpg?auto=webp&s=1b5f80a3421dd2e4b2f7c3fa5c87dd2ab4364981",
    },
    {
      caption: "dashcam footage of a car crashing into shrek",
      src: "https://preview.redd.it/z2gr1uxjj6591.png?auto=webp&s=a1fd7b8e6ae0e7fcb4e04b41d39c1068da99610e",
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
