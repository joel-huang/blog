"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

interface SummaryCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SummaryCard({ children, className }: SummaryCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  const toMarkdown = (node: ChildNode, indent = ""): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    const tag = node.tagName.toLowerCase();
    const childText = (prefix = "") =>
      Array.from(node.childNodes)
        .map((child) => toMarkdown(child, prefix))
        .join("");

    switch (tag) {
      case "br":
        return "\n";
      case "p": {
        const text = childText(indent).trim();
        return text ? `${text}\n\n` : "";
      }
      case "strong":
      case "b":
        return `**${childText(indent).trim()}**`;
      case "em":
      case "i":
        return `*${childText(indent).trim()}*`;
      case "code": {
        const text = node.textContent ?? "";
        return node.parentElement?.tagName.toLowerCase() === "pre"
          ? text
          : `\`${text.trim()}\``;
      }
      case "pre": {
        const text = node.textContent ?? "";
        return `\`\`\`\n${text.trim()}\n\`\`\`\n\n`;
      }
      case "ul": {
        const items = Array.from(node.children)
          .filter((child) => child.tagName.toLowerCase() === "li")
          .map(
            (child) => `${indent}- ${toMarkdown(child, indent + "  ").trim()}`
          );
        return items.join("\n") + "\n\n";
      }
      case "ol": {
        const items = Array.from(node.children)
          .filter((child) => child.tagName.toLowerCase() === "li")
          .map(
            (child, index) =>
              `${indent}${index + 1}. ${toMarkdown(
                child,
                indent + "  "
              ).trim()}`
          );
        return items.join("\n") + "\n\n";
      }
      case "li": {
        const text = childText(indent).trim();
        return text.replace(/\n{3,}/g, "\n\n");
      }
      default:
        return childText(indent);
    }
  };

  const copy = async () => {
    const root = contentRef.current;
    const text = root
      ? Array.from(root.childNodes)
          .map((child) => toMarkdown(child))
          .join("")
          .trim()
      : "";
    if (!text) return;
    const appBaseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const watermark = `Ref: ${appBaseUrl}${window.location.pathname}`;
    await navigator.clipboard.writeText(`${watermark}\n\n${text}`);
    setCopied(true);
    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside
      className={cn("bg-background-muted rounded-lg elevated my-8", className)}
    >
      <div className="flex text-xs text-foreground-muted border-b border-background-interesting px-3 py-2">
        <div className="uppercase tracking-wider">SUMMARY</div>
        <div className="ml-auto hover:text-foreground-highlight flex items-center">
          {copied ? (
            <Check className="text-success" size={14} />
          ) : (
            <Copy size={12} onClick={copy} />
          )}
        </div>
      </div>
      <div ref={contentRef} className="px-6 pt-4 pb-6">
        {children}
      </div>
    </aside>
  );
}
