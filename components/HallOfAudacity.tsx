"use client";

import { motion } from "framer-motion";
import SubmissionCard, { type SubmissionData } from "./SubmissionCard";

interface HallOfAudacityProps {
  submissions: SubmissionData[];
}

export default function HallOfAudacity({ submissions }: HallOfAudacityProps) {
  const top5 = [...submissions]
    .sort((a, b) => b.totalReactions - a.totalReactions)
    .slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <section className="mt-16 mb-10">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="font-serif text-2xl text-warm-brown mb-1"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {"\ud83c\udfc6"} Hall of Audacity
        </motion.h2>
        <p className="font-sans text-sm text-warm-brown/50">
          These hit different. The community spoke.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {top5.map((s, i) => (
          <SubmissionCard key={s.id} submission={s} isGold index={i} />
        ))}
      </div>
    </section>
  );
}
