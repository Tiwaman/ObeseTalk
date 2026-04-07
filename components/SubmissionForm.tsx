"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHO_OPTIONS, WHERE_OPTIONS } from "@/lib/utils";
import type { SubmissionData } from "./SubmissionCard";

interface SubmissionFormProps {
  onSubmit: (submission: SubmissionData) => void;
  onToast: (msg: string) => void;
}

export default function SubmissionForm({ onSubmit, onToast }: SubmissionFormProps) {
  const [text, setText] = useState("");
  const [whoSaidIt, setWhoSaidIt] = useState("");
  const [whereSaid, setWhereSaid] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDrop, setShowDrop] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    setShowDrop(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          whoSaidIt: whoSaidIt || null,
          whereSaid: whereSaid || null,
          submitterName: submitterName.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const submission: SubmissionData = await res.json();

      // Wait for drop animation
      setTimeout(() => {
        setShowDrop(false);
        onSubmit(submission);
        onToast("Your note is in the jar. \ud83c\udffa You're not alone in this.");
        setText("");
        setWhoSaidIt("");
        setWhereSaid("");
        setSubmitterName("");
        setSubmitting(false);
      }, 800);
    } catch {
      setShowDrop(false);
      setSubmitting(false);
      onToast("Something went wrong. Try again?");
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-10">
      <div className="shimmer-border rounded-2xl shadow-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-5 md:p-6 relative z-10"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did someone say to you? Drop it in the jar..."
          rows={3}
          className="w-full resize-none bg-transparent font-sans text-warm-brown placeholder:text-warm-brown/35 focus:outline-none text-sm md:text-base leading-relaxed"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <select
            value={whoSaidIt}
            onChange={(e) => setWhoSaidIt(e.target.value)}
            className="px-3 py-2 rounded-lg border border-warm-brown/15 bg-cream/50 text-xs font-sans text-warm-brown/70 focus:outline-none focus:border-coral/40"
          >
            <option value="">Who said it?</option>
            {WHO_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <select
            value={whereSaid}
            onChange={(e) => setWhereSaid(e.target.value)}
            className="px-3 py-2 rounded-lg border border-warm-brown/15 bg-cream/50 text-xs font-sans text-warm-brown/70 focus:outline-none focus:border-coral/40"
          >
            <option value="">Where were you?</option>
            {WHERE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-3 items-stretch sm:items-center">
          <input
            type="text"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="Your name (optional — leave blank to stay anonymous)"
            className="flex-1 px-3 py-2 rounded-lg border border-warm-brown/15 bg-cream/50 text-xs font-sans text-warm-brown/70 placeholder:text-warm-brown/30 focus:outline-none focus:border-coral/40"
          />

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-6 py-2.5 bg-coral hover:bg-coral-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans font-medium text-sm rounded-full transition-colors shadow-sm whitespace-nowrap"
          >
            Drop it in \ud83c\udffa
          </button>
        </div>
      </form>
      </div>

      {/* Drop animation overlay */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, y: -120, rotate: -10, scale: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none"
          >
            <div className="w-20 h-14 bg-note-bg rounded shadow-md flex items-center justify-center transform rotate-2">
              <div className="w-12 h-1 bg-warm-brown/20 rounded mb-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
