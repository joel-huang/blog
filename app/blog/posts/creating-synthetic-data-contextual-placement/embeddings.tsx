"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import seedrandom from "seedrandom";
import { Pointer } from "lucide-react";

function round(p: number, n: number) {
  return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}

function getRandomColors(x: number, y: number, size: number) {
  let rng = seedrandom(((x + 1) / (y + 1) + x + y).toString());
  let array: string[] = [];
  for (let i = 0; i < size; i++) {
    const value = Math.floor(rng() * 255);
    array.push(`rgb(${value}, ${value}, ${value})`);
  }
  return array;
}

const Embeddings: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<SVGSVGElement>(null);
  const zoomedRef = useRef<SVGSVGElement>(null);
  const encoderRef = useRef<SVGSVGElement>(null);
  const embeddingRef = useRef<SVGSVGElement>(null);

  const gsize = 24;
  const [dim, _setDim] = React.useState(() => Math.round(576 / gsize) * gsize);

  const setDim = (newDim: number) => {
    _setDim((prevDim) => Math.round(newDim / gsize) * gsize);
  };

  const gdim = Math.floor(dim / gsize);
  const transitionTime = 100;
  const imgUrl =
    "/blog/creating-synthetic-data-contextual-placement/10452_sat.jpg";

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDim(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function drawGrid(
    full: d3.Selection<SVGSVGElement, unknown, null, undefined>
  ) {
    for (let i = 0; i < gsize - 1; i++) {
      full
        .append("line")
        .attr("x1", (i + 1) * gdim)
        .attr("y1", 0)
        .attr("x2", (i + 1) * gdim)
        .attr("y2", dim)
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1);
      full
        .append("line")
        .attr("x1", 0)
        .attr("y1", (i + 1) * gdim)
        .attr("x2", dim)
        .attr("y2", (i + 1) * gdim)
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1);
    }
  }

  function drawRects(
    vector: d3.Selection<SVGGElement, unknown, null, undefined>,
    x: number,
    y: number
  ) {
    const numRects = 8;
    const spacing = 5;
    const totalSpacing = spacing * (numRects + 1);
    const rectSize = Math.floor(
      (parseInt(vector.attr("height")!) - totalSpacing) / numRects
    );
    const colors = getRandomColors(x, y, numRects);

    let rects = vector.selectAll<SVGRectElement, unknown>("rect");

    for (let i = 0; i < numRects; i++) {
      let r = rects.nodes()[i];
      if (r === undefined) {
        r = vector
          .append("rect")
          .attr("x", spacing)
          .attr("y", (i + 1) * spacing + i * rectSize)
          .attr("width", rectSize)
          .attr("height", rectSize)
          .node()!;
      }
      d3.select(r).attr("style", `fill: ${colors[i]}`);
    }
    vector.attr("width", rectSize + 2 * spacing);
    vector.attr("height", numRects * (rectSize + spacing) + spacing);
    return numRects;
  }

  useEffect(() => {
    // clear all existing elements
    d3.select(fullRef.current).selectAll("*").remove();
    d3.select(zoomedRef.current).selectAll("*").remove();
    d3.select(encoderRef.current).selectAll("*").remove();
    d3.select(embeddingRef.current).selectAll("*").remove();

    const full = d3
      .select(fullRef.current)
      .attr("cursor", "none")
      .attr("width", dim)
      .attr("height", dim);

    const zoomed = d3
      .select(zoomedRef.current)
      .attr("width", dim / 2)
      .attr("height", dim / 2);

    const img = full
      .append("svg:image")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", dim)
      .attr("height", dim)
      .attr("xlink:href", imgUrl);

    if (fullRef.current) {
      drawGrid(full as d3.Selection<SVGSVGElement, unknown, null, undefined>);
    }

    const rect = full
      .append("rect")
      .attr("width", gdim)
      .attr("height", gdim)
      .attr(
        "style",
        "fill: rgba(0, 0, 0, 0.1); stroke-width: 2; stroke: rgb(255, 255, 255);"
      );

    const magnified = zoomed
      .append("svg:image")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", dim * gsize)
      .attr("height", dim * gsize)
      .attr("xlink:href", imgUrl)
      .attr("image-rendering", "pixelated");

    const encoder = d3
      .select(encoderRef.current)
      .attr("width", Math.floor(dim / 2.5))
      .attr("height", Math.floor(dim / 2));

    const w = parseInt(encoder.attr("width")!);
    const h = parseInt(encoder.attr("height")!);
    const px = Math.floor(w / 5);
    const py = 2 * px;
    encoder
      .append("polygon")
      .attr(
        "points",
        `${w - px} ${py}, ${px} ${px}, ${px} ${h - px}, ${w - px} ${h - py}`
      )
      .attr("fill", "rgba(255, 255, 255, 0.1)")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 2);

    encoder
      .append("text")
      .attr("x", Math.floor(w / 2))
      .attr("y", Math.floor(h / 2) - 10) // Adjust starting position
      .style("text-anchor", "middle")
      .style("fill", "rgba(255, 255, 255, 0.6)")
      .style("font-size", 16)
      .selectAll("tspan")
      .data(["Pre-trained", "Encoder"])
      .enter()
      .append("tspan")
      .attr("x", Math.floor(w / 2))
      .attr("dy", (d, i) => i * 20) // Line spacing
      .text((d) => d);

    const embedding = d3
      .select(embeddingRef.current)
      .attr("width", 40)
      .attr("height", dim / 2);
    const embeddingGroup = embedding.append("g").attr("height", dim / 2);

    drawRects(embeddingGroup, 0, 0);

    full.on("mousemove", (event) => {
      const coords = d3.pointer(event);
      const x = round(
        Math.max(
          0,
          Math.min(
            parseInt(img.attr("width")!) - gdim,
            coords[0] - Math.floor(gdim / 2)
          )
        ),
        gdim
      );
      const y = round(
        Math.max(
          0,
          Math.min(
            parseInt(img.attr("width")!) - gdim,
            coords[1] - Math.floor(gdim / 2)
          )
        ),
        gdim
      );
      rect
        .transition()
        .duration(transitionTime)
        .ease(d3.easeQuadOut)
        .attr("x", x)
        .attr("y", y);

      magnified
        .transition()
        .duration(transitionTime)
        .ease(d3.easeQuadOut)
        .attr("x", -x * gsize)
        .attr("y", -y * gsize);

      drawRects(embeddingGroup, x, y);
    });
  }, [dim]);

  return (
    <>
      <div
        className="w-full flex flex-col items-center overflow-hidden"
        ref={containerRef}
      >
        <svg className="select-none" id="full" ref={fullRef}></svg>
        <span className="flex gap-2 items-center text-sm text-neutral-400 mt-2">
          <Pointer size={16} /> Interact with cells to see what the encoder sees
        </span>
      </div>
      <div className="w-full flex justify-between mt-4">
        <svg className="select-none" id="zoomed" ref={zoomedRef}></svg>
        <svg className="select-none" id="encoder" ref={encoderRef}></svg>
        <svg className="select-none" id="embedding" ref={embeddingRef}></svg>
      </div>
    </>
  );
};

export default Embeddings;
