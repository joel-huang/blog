"use client";

import { Check, Copy } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

interface CopyButtonProps {
  pre: React.ReactNode;
  className?: string;
}

export function CopyCodeButton({ pre, className, ...props }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    if (!pre) return;
    if (React.isValidElement(pre) && pre.props.dangerouslySetInnerHTML) {
      const innerHtml = pre.props.dangerouslySetInnerHTML.__html;
      setCodeText(innerHtml);
    }
  }, [pre]);

  const copy = async () => {
    if (!codeText) return;
    await navigator.clipboard.writeText(codeText.trim());
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <button
      className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
      disabled={isCopied}
      onClick={copy}
      aria-label="Copy"
      {...props}
    >
      <span className="sr-only">Copy</span>
      {isCopied ? (
        <Check size={16} className="text-green-300" />
      ) : (
        <Copy size={16} />
      )}
    </button>
  );
}
