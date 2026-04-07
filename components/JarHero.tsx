"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

interface Stats {
  weeklyCount: number;
  allTimeGotThisToo: number;
  mostReactedThisWeek: { text: string; count: number } | null;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [value, inView, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

// Floating paper notes that drift in the background
const floatingNotes = [
  { x: "10%", delay: 0, duration: 6, rotate: -15, color: "#FFF0DB", size: 28 },
  { x: "80%", delay: 0.5, duration: 7, rotate: 12, color: "#FFE4E1", size: 24 },
  { x: "25%", delay: 1.2, duration: 8, rotate: -8, color: "#E8F0E8", size: 20 },
  { x: "65%", delay: 0.8, duration: 6.5, rotate: 20, color: "#F0E8FF", size: 22 },
  { x: "45%", delay: 1.5, duration: 7.5, rotate: -5, color: "#FFE8D6", size: 26 },
  { x: "90%", delay: 0.3, duration: 6.8, rotate: 10, color: "#FFF0DB", size: 18 },
  { x: "5%", delay: 1.8, duration: 7.2, rotate: -18, color: "#FFE4E1", size: 20 },
];

export default function JarHero() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="text-center pt-6 pb-4 relative overflow-hidden">
      {/* Floating paper notes background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingNotes.map((note, i) => (
          <motion.div
            key={i}
            className="absolute rounded-sm opacity-0"
            style={{
              left: note.x,
              width: note.size,
              height: note.size * 0.7,
              backgroundColor: note.color,
              boxShadow: "1px 1px 3px rgba(0,0,0,0.08)",
            }}
            initial={{ opacity: 0, y: 120, rotate: 0 }}
            animate={{
              opacity: [0, 0.5, 0.5, 0],
              y: [120, -40],
              rotate: [0, note.rotate],
            }}
            transition={{
              duration: note.duration,
              delay: note.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Soft radial glow behind jar */}
      <motion.div
        className="absolute left-1/2 top-16 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Mason Jar SVG with wobble */}
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          mass: 1.2,
        }}
        className="mx-auto mb-4 relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, -1.5, 1.5, -0.5, 0] }}
          transition={{
            duration: 3,
            delay: 0.8,
            ease: "easeInOut",
          }}
        >
          <svg
            width="140"
            height="180"
            viewBox="0 0 140 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto drop-shadow-lg"
          >
            {/* Jar lid / rim */}
            <rect x="30" y="10" width="80" height="10" rx="3" fill="#8B7355" />
            <rect x="26" y="18" width="88" height="6" rx="2" fill="#A08B6E" />
            <rect x="35" y="6" width="70" height="6" rx="3" fill="#9A8468" />

            {/* Jar body - glass effect */}
            <path
              d="M28 24 C28 24, 22 35, 22 50 L22 145 C22 158, 32 168, 45 168 L95 168 C108 168, 118 158, 118 145 L118 50 C118 35, 112 24, 112 24 Z"
              fill="#E8DDD0"
              fillOpacity="0.35"
              stroke="#C4B5A0"
              strokeWidth="2"
            />

            {/* Glass shine */}
            <path
              d="M34 35 C34 35, 30 45, 30 55 L30 130 C30 130, 30 132, 32 132"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Animated notes inside jar — stagger with SVG animation */}
            {[
              { x: 40, y: 100, w: 22, h: 16, fill: "#FFF0DB", rot: -8 },
              { x: 65, y: 105, w: 20, h: 15, fill: "#FFE4E1", rot: 5 },
              { x: 50, y: 118, w: 24, h: 14, fill: "#E8F0E8", rot: -3 },
              { x: 75, y: 120, w: 18, h: 14, fill: "#FFF0DB", rot: 7 },
              { x: 42, y: 133, w: 20, h: 13, fill: "#FFE8D6", rot: 4 },
              { x: 68, y: 136, w: 22, h: 14, fill: "#F0E8FF", rot: -6 },
              { x: 55, y: 145, w: 25, h: 12, fill: "#FFE4E1", rot: 2 },
            ].map((note, i) => (
              <motion.rect
                key={i}
                x={note.x}
                y={note.y}
                width={note.w}
                height={note.h}
                rx="2"
                fill={note.fill}
                transform={`rotate(${note.rot} ${note.x} ${note.y})`}
                initial={{ opacity: 0, y: note.y - 30 }}
                animate={{ opacity: 1, y: note.y }}
                transition={{
                  delay: 0.6 + i * 0.12,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Little pen marks on notes */}
            <line x1="44" y1="105" x2="55" y2="104" stroke="#C4B5A0" strokeWidth="0.8" opacity="0.5" />
            <line x1="68" y1="110" x2="78" y2="111" stroke="#C4B5A0" strokeWidth="0.8" opacity="0.5" />
            <line x1="54" y1="123" x2="66" y2="122" stroke="#C4B5A0" strokeWidth="0.8" opacity="0.5" />

            {/* Heart on jar — pulse */}
            <motion.path
              d="M65 78 C65 74, 60 71, 57 74 C54 71, 49 74, 49 78 C49 84, 57 90, 57 90 C57 90, 65 84, 65 78Z"
              fill="#E8735A"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Title — staggered word reveal */}
      <motion.h1
        className="font-serif text-3xl md:text-4xl text-warm-brown mb-2 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {"The Unsolicited Advice Jar".split(" ").map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.3em]"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.4 + i * 0.12,
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle — fade up */}
      <motion.p
        className="font-sans text-warm-brown/60 text-sm md:text-base max-w-md mx-auto mb-6 px-4 relative z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        A place to drop every ridiculous thing someone said to you about your
        body. You&apos;re not alone.
      </motion.p>

      {/* Weekly Stats Bar — with animated counters */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.6, type: "spring", stiffness: 200 }}
          className="bg-white/60 border border-warm-brown/10 rounded-xl px-4 py-3 max-w-2xl mx-auto relative z-10"
        >
          <p className="font-sans text-xs md:text-sm text-warm-brown/60 leading-relaxed">
            This week:{" "}
            <span className="font-medium text-warm-brown">
              <AnimatedCounter value={stats.weeklyCount} duration={1.5} /> notes dropped
            </span>
            {stats.mostReactedThisWeek && (
              <>
                {" \u00b7 Most relatable: "}
                <span className="italic text-warm-brown/80">
                  &ldquo;{stats.mostReactedThisWeek.text}&rdquo;
                </span>
              </>
            )}
            {" \u00b7 "}
            <span className="font-medium text-coral">
              <AnimatedCounter value={stats.allTimeGotThisToo} duration={2.5} /> people
            </span>{" "}
            said &ldquo;I got this one too&rdquo;
          </p>
        </motion.div>
      )}
    </div>
  );
}
