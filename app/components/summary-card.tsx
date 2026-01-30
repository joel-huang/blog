import React from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SummaryCard({ children, className }: SummaryCardProps) {
  return (
    <aside
      className={cn("bg-background-muted rounded-lg elevated p-4", className)}
    >
      <div className="text-xs uppercase tracking-wider text-foreground-muted">
        SUMMARY
      </div>
      <div className="mt-2 text-foreground [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2">
        {children}
      </div>
    </aside>
  );
}
