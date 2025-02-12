"use client";

import IconLink from "@/app/components/icon-link";
import React, { useState } from "react";

interface PreviewProps {
  text: string;
  imageUrl: string;
  href?: string;
}

const HoverImagePreview: React.FC<PreviewProps> = ({
  text,
  imageUrl,
  href,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    setIsMobile(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return (
    <div className="preview-container">
      {href ? (
        <IconLink
          href={href}
          className="preview-text"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {text}
        </IconLink>
      ) : (
        <div
          className="preview-text"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {text}
        </div>
      )}
      {isHovered &&
        (isMobile ? (
          <></>
        ) : (
          <div className="preview-popup absolute mx-auto left-0 right-0 elevated rounded p-2 max-w-md h-fit bg-neutral-900">
            <img src={imageUrl || "/dalle1.webp"} />
          </div>
        ))}
    </div>
  );
};

export default HoverImagePreview;
