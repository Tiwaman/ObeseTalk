"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import JarHero from "@/components/JarHero";
import SubmissionForm from "@/components/SubmissionForm";
import SubmissionCard, { type SubmissionData } from "@/components/SubmissionCard";
import FeedFilters from "@/components/FeedFilters";
import HallOfAudacity from "@/components/HallOfAudacity";
import AboutModal from "@/components/AboutModal";
import Toast from "@/components/Toast";

export default function HomePage() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [sort, setSort] = useState<"latest" | "top">("latest");
  const [whoFilter, setWhoFilter] = useState("");
  const [whereFilter, setWhereFilter] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/submissions?sort=latest")
      .then((r) => r.json())
      .then(setSubmissions)
      .catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  const handleNewSubmission = useCallback((sub: SubmissionData) => {
    setSubmissions((prev) => [sub, ...prev]);
    setNewIds((prev) => new Set(prev).add(sub.id));
  }, []);

  const filtered = useMemo(() => {
    let list = [...submissions];
    if (whoFilter) list = list.filter((s) => s.whoSaidIt === whoFilter);
    if (whereFilter) list = list.filter((s) => s.whereSaid === whereFilter);
    if (sort === "top") {
      list.sort((a, b) => (b.reactions.GOT_THIS_TOO || 0) - (a.reactions.GOT_THIS_TOO || 0));
    }
    return list;
  }, [submissions, whoFilter, whereFilter, sort]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header — slide down */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-warm-brown/8"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="font-serif text-lg text-warm-brown font-semibold">
            {"\ud83c\udffa"} ObeseTalk
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="#hall-of-audacity"
              className="font-sans text-xs text-warm-brown/50 hover:text-coral transition-colors"
            >
              Hall of Audacity
            </a>
            <button
              onClick={() => setAboutOpen(true)}
              className="font-sans text-xs text-warm-brown/50 hover:text-coral transition-colors"
            >
              About this space
            </button>
          </nav>
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <JarHero />

        {/* Form — fade up with delay */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
        >
          <SubmissionForm onSubmit={handleNewSubmission} onToast={showToast} />
        </motion.div>

        {/* Filters — fade in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <FeedFilters
            sort={sort}
            whoFilter={whoFilter}
            whereFilter={whereFilter}
            onSortChange={setSort}
            onWhoChange={setWhoFilter}
            onWhereChange={setWhereFilter}
          />
        </motion.div>

        {/* Feed — staggered cascade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {filtered.map((s, i) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              isNew={newIds.has(s.id)}
              index={i}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="font-sans text-warm-brown/40 text-sm">
                No notes here yet. Be the first to drop one in the jar.
              </p>
            </div>
          )}
        </div>

        {/* Hall of Audacity */}
        <div id="hall-of-audacity">
          <HallOfAudacity submissions={submissions} />
        </div>
      </main>

      {/* Footer — fade in */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="border-t border-warm-brown/8 bg-cream"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="font-sans text-sm text-warm-brown/60 mb-2">
            ObeseTalk.com — built with love, for people who deserve better.
          </p>
          <p className="font-sans text-xs text-warm-brown/40 mb-3">
            This is a safe space. Zero tolerance for trolls, diet culture, or
            fetishization.
          </p>
          <a
            href="mailto:hello@obesetalk.com"
            className="font-sans text-xs text-coral hover:text-coral-dark transition-colors"
          >
            Submit a concern
          </a>
        </div>
      </motion.footer>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Toast message={toast} visible={toastVisible} />
    </div>
  );
}
