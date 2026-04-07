"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { type ReactionType, REACTION_CONFIG } from "@/lib/utils";

interface ReactionButtonProps {
  type: ReactionType;
  count: number;
  submissionId: string;
}

export default function ReactionButton({ type, count, submissionId }: ReactionButtonProps) {
  const config = REACTION_CONFIG[type];
  const storageKey = `reaction_${submissionId}_${type}`;

  const [reacted, setReacted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });
  const [displayCount, setDisplayCount] = useState(count);

  const handleClick = useCallback(async () => {
    if (reacted) return;

    setReacted(true);
    setDisplayCount((c) => c + 1);
    localStorage.setItem(storageKey, "1");

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, type }),
      });
    } catch {
      setReacted(false);
      setDisplayCount((c) => c - 1);
      localStorage.removeItem(storageKey);
    }
  }, [reacted, submissionId, type, storageKey]);

  return (
    <motion.button
      whileTap={!reacted ? { scale: 1.2 } : undefined}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all duration-200 border ${
        reacted
          ? "bg-coral/15 border-coral/40 text-coral-dark"
          : "bg-white border-warm-brown/15 text-warm-brown/70 hover:bg-coral/8 hover:border-coral/30 hover:text-coral-dark cursor-pointer"
      }`}
      disabled={reacted}
      title={config.label}
    >
      <span className="text-sm">{config.emoji}</span>
      <span className="font-medium">{displayCount}</span>
    </motion.button>
  );
}
