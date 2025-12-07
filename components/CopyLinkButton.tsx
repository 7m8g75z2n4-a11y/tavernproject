"use client";

import { useState } from "react";

type Props = {
  value: string;
  className?: string;
};

export function CopyLinkButton({ value, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "rounded-full border border-amber-500/50 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(245,199,106,0.3)] hover:shadow-[0_0_20px_rgba(245,199,106,0.3)] transition-shadow"
      }
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
