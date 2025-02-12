import NextLink from "next/link";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  [key: string]: any;
}

const IconLink: React.FC<LinkProps> = ({ href, children, ...props }) => {
  return (
    <NextLink
      href={href}
      {...props}
      className={cn("w-fit h-2 inline-block items-center", props.className)}
    >
      <ArrowUpRight className="inline-block" size={16} />
      {children}
    </NextLink>
  );
};

export default IconLink;
