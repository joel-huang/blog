import Link from "next/link";
import IconLink from "@/app/components/icon-link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { inconsolata } from "@/app/fonts";
import React from "react";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import Timeline from "@/app/blog/posts/the-golden-hour-of-craiyon-dalle-mini/timeline";
import HoverImagePreview from "@/app/blog/posts/the-golden-hour-of-craiyon-dalle-mini/hover-image-preview";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import CraiyonExamples from "@/app/blog/posts/the-golden-hour-of-craiyon-dalle-mini/craiyon";

const TimingChart = dynamic(
  () => import("@/app/blog/posts/blazing-fast-pairwise-cosine-similarity/chart")
);

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props) {
  let href = props.href;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  return <IconLink target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />;
}

function Code({ children, ...props }) {
  return (
    <code
      dangerouslySetInnerHTML={{ __html: children }}
      {...props}
      className={cn(props.className, inconsolata.className)}
    />
  );
}

const CopyCodeButton = dynamic(() =>
  import("@/app/components/copy-code-button").then((mod) => mod.CopyCodeButton)
);

function Pre({ children }) {
  return (
    <div className="relative">
      <pre>{children}</pre>
      <div className="absolute top-2 right-2">
        <CopyCodeButton pre={children} />
      </div>
    </div>
  );
}

function slugify(str: { toString: () => string }) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children);
    return React.createElement(`h${level}`, { id: slug }, children);
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  pre: Pre,
  Table,
  TimingChart,
  Timeline,
  CraiyonExamples,
  HoverImagePreview,
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          development: process.env.NODE_ENV === "development",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }}
    />
  );
}
