"use client";

import Image from "next/image";
import React, { useRef } from "react";
import Slider from "@/app/components/slider";

const title = "the-golden-hour-of-craiyon-dalle-mini";

const Timeline = () => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [dataIndex, setDataIndex] = React.useState(0);
  const [userSliding, setUserSliding] = React.useState(false);

  const timelineData = [
    {
      name: "DALL-E 1",
      date: new Date("2021-01-01"),
      image: `/blog/${title}/dalle1.webp`,
    },
    {
      name: "VQGAN-CLIP",
      date: new Date("2021-06-01"),
      image: `/blog/${title}/vqgan-clip.webp`,
    },
    {
      name: "DALL-E Mini",
      date: new Date("2021-07-01"),
      image: `/blog/${title}/dalle-mini.webp`,
    },
    {
      name: "Latent Diffusion",
      date: new Date("2021-12-01"),
      image: `/blog/${title}/ldm.webp`,
    },
    {
      name: "Midjourney v1",
      date: new Date("2022-02-01"),
      image: `/blog/${title}/midjourney.webp`,
    },
    {
      name: "DALL-E 2",
      date: new Date("2022-04-01"),
      image: `/blog/${title}/dalle2.webp`,
    },
    {
      name: "Parti",
      date: new Date("2022-06-22"),
      image: `/blog/${title}/parti.webp`,
    },
    {
      name: "Stable Diffusion",
      date: new Date("2022-08-22"),
      image: `/blog/${title}/sd15.webp`,
    },
    {
      name: "Imagen",
      date: new Date("2023-04-01"),
      image: `/blog/${title}/imagen.webp`,
    },
    {
      name: "DALL-E 3",
      date: new Date("2023-09-01"),
      image: `/blog/${title}/dalle3.webp`,
    },
    {
      name: "Flux",
      date: new Date("2024-08-01"),
      image: `/blog/${title}/flux.webp`,
    },
  ];

  React.useEffect(() => {
    const data = timelineData[dataIndex];
    if (data.image && imgRef.current) {
      const img = imgRef.current?.querySelector("img");
      if (img) {
        img.src = data.image;
        img.alt = data.name;
      }
    }
  }, [dataIndex]);

  React.useEffect(() => {
    if (userSliding) {
      const timeout = setTimeout(() => {
        setUserSliding(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [userSliding]);

  React.useEffect(() => {
    if (!userSliding) {
      const timeout = setTimeout(() => {
        setDataIndex((dataIndex + 1) % timelineData.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [dataIndex, userSliding]);

  return (
    <div
      ref={parentRef}
      className="flex flex-col w-full gap-4 p-4 items-center"
    >
      <Image
        ref={imgRef}
        src={timelineData[dataIndex].image || `/blog/${title}/dalle1.webp`}
        alt=""
        width={256}
        height={256}
      />
      <Slider
        min={0}
        max={timelineData.length - 1}
        value={dataIndex}
        onChange={(value) => setDataIndex(value)}
        onSliderClick={() => setUserSliding(true)}
        labels={timelineData.map((data) => ({
          year: data.date.getFullYear(),
          name: data.name,
        }))}
      />
    </div>
  );
};

export default Timeline;
