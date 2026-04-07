"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CommentFormProps {
  submissionId: string;
  parentId?: string;
  placeholder?: string;
  onSubmit: (comment: { id: string; text: string; authorName: string | null; createdAt: string; replies: [] }) => void;
  onCancel?: () => void;
}

export default function CommentForm({ submissionId, parentId, placeholder, onSubmit, onCancel }: CommentFormProps) {
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          text: text.trim(),
          authorName: authorName.trim() || null,
          parentId: parentId || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const comment = await res.json();
      onSubmit(comment);
      setText("");
      setAuthorName("");
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder || "Add a comment..."}
        rows={2}
        className="w-full resize-none bg-cream/60 border border-warm-brown/10 rounded-lg px-3 py-2 font-sans text-xs text-warm-brown placeholder:text-warm-brown/30 focus:outline-none focus:border-coral/30"
        required
      />
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          className="flex-1 px-3 py-1.5 bg-cream/60 border border-warm-brown/10 rounded-lg font-sans text-xs text-warm-brown/70 placeholder:text-warm-brown/25 focus:outline-none focus:border-coral/30"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-1.5 bg-coral hover:bg-coral-dark disabled:opacity-40 text-white font-sans font-medium text-xs rounded-full transition-colors whitespace-nowrap"
        >
          {parentId ? "Reply" : "Comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-warm-brown/40 hover:text-warm-brown/60 font-sans text-xs transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
