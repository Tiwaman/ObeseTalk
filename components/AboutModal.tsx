"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-cream rounded-2xl shadow-xl max-w-md w-full p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-warm-brown/50 hover:text-warm-brown transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="font-serif text-2xl text-warm-brown mb-4">
                About this space
              </h2>
              <p className="font-sans text-warm-brown/80 leading-relaxed text-sm">
                ObeseTalk is a living room for people in bigger bodies. No diet
                talk. No before/afters. No unsolicited advice from us — we leave
                that to the jar.
              </p>
              <p className="font-sans text-warm-brown/80 leading-relaxed text-sm mt-3">
                This is just people, just talking.
              </p>
              <div className="mt-6 pt-4 border-t border-warm-brown/10">
                <p className="text-xs text-warm-brown/50 font-sans">
                  This is a safe space. Zero tolerance for trolls, diet culture,
                  or fetishization.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
