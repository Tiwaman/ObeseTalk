"use client";

import { motion } from "framer-motion";
import ReactionButton from "./ReactionButton";
import CommentThread from "./CommentThread";
import { relativeTime, cardRotation, WHO_EMOJI, WHERE_EMOJI, type ReactionType } from "@/lib/utils";

export interface SubmissionData {
  id: string;
  text: string;
  whoSaidIt: string | null;
  whereSaid: string | null;
  submitterName: string | null;
  createdAt: string;
  reactions: Record<string, number>;
  totalReactions: number;
  commentCount: number;
}

interface SubmissionCardProps {
  submission: SubmissionData;
  isNew?: boolean;
  isGold?: boolean;
  index?: number;
}

export default function SubmissionCard({ submission, isNew, isGold, index = 0 }: SubmissionCardProps) {
  const rotation = cardRotation(submission.id);

  return (
    <motion.div
      initial={
        isNew
          ? { opacity: 0, y: -30, scale: 0.9, rotate: rotation - 5 }
          : { opacity: 0, y: 40, scale: 0.95 }
      }
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: isNew ? 0 : Math.min(index * 0.07, 0.8),
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        rotate: 0,
        boxShadow: isGold
          ? "3px 5px 20px rgba(232,197,71,0.25), 2px 2px 8px rgba(0,0,0,0.1)"
          : "3px 5px 16px rgba(0,0,0,0.15), 2px 2px 6px rgba(0,0,0,0.08)",
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
      className={`p-5 rounded-lg relative cursor-default ${
        isGold
          ? "bg-gold-bg border border-gold-border/50"
          : "bg-note-bg"
      }`}
      style={{
        boxShadow: isGold
          ? "2px 3px 12px rgba(232,197,71,0.2), 1px 1px 4px rgba(0,0,0,0.08)"
          : "2px 3px 8px rgba(0,0,0,0.12), 1px 1px 3px rgba(0,0,0,0.06)",
      }}
      role="article"
    >
      <p className="font-sans text-warm-brown text-base leading-relaxed mb-3 relative z-10">
        &ldquo;{submission.text}&rdquo;
      </p>

      <div className="flex flex-wrap gap-2 mb-3 relative z-10">
        {submission.whoSaidIt && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-brown/8 text-warm-brown/70 text-xs font-sans">
            {WHO_EMOJI[submission.whoSaidIt] || ""} {submission.whoSaidIt}
          </span>
        )}
        {submission.whereSaid && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warm-brown/8 text-warm-brown/70 text-xs font-sans">
            {WHERE_EMOJI[submission.whereSaid] || ""} {submission.whereSaid}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs text-warm-brown/40 font-sans">
          {submission.submitterName || "Anonymous"} · {relativeTime(submission.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 relative z-10">
        {(["DID_NOT", "GOT_THIS_TOO", "AUDACITY", "SENDING_LOVE"] as ReactionType[]).map(
          (type) => (
            <ReactionButton
              key={type}
              type={type}
              count={submission.reactions[type] || 0}
              submissionId={submission.id}
            />
          )
        )}
      </div>

      {/* Comment Thread */}
      <CommentThread
        submissionId={submission.id}
        commentCount={submission.commentCount ?? 0}
      />
    </motion.div>
  );
}
