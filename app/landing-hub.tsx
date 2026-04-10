"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const products = [
  {
    title: "The Unsolicited Advice Jar",
    description:
      "Drop every ridiculous thing someone said to you about your body. You're not alone.",
    href: "/jar",
    cta: "Open the Jar",
    icon: "jar" as const,
  },
  {
    title: "Chat Rooms",
    description:
      "Connect with others who get it. Real talk, real support, zero judgment.",
    href: "/chat",
    cta: "Join a Room",
    icon: "chat" as const,
  },
];

/* ── Simplified Mason Jar SVG (no animated inner notes) ── */
function JarIcon() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        width="80"
        height="100"
        viewBox="0 0 140 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto drop-shadow-md"
      >
        {/* Lid */}
        <rect x="30" y="10" width="80" height="10" rx="3" fill="#8B7355" />
        <rect x="26" y="18" width="88" height="6" rx="2" fill="#A08B6E" />
        <rect x="35" y="6" width="70" height="6" rx="3" fill="#9A8468" />

        {/* Jar body */}
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

        {/* Static pastel notes inside */}
        <rect x="40" y="100" width="22" height="16" rx="2" fill="#FFF0DB" transform="rotate(-8 40 100)" />
        <rect x="65" y="105" width="20" height="15" rx="2" fill="#FFE4E1" transform="rotate(5 65 105)" />
        <rect x="50" y="118" width="24" height="14" rx="2" fill="#E8F0E8" transform="rotate(-3 50 118)" />
        <rect x="75" y="120" width="18" height="14" rx="2" fill="#FFF0DB" transform="rotate(7 75 120)" />
        <rect x="42" y="133" width="20" height="13" rx="2" fill="#FFE8D6" transform="rotate(4 42 133)" />
        <rect x="68" y="136" width="22" height="14" rx="2" fill="#F0E8FF" transform="rotate(-6 68 136)" />
        <rect x="55" y="145" width="25" height="12" rx="2" fill="#FFE4E1" transform="rotate(2 55 145)" />

        {/* Pen marks */}
        <line x1="44" y1="105" x2="55" y2="104" stroke="#C4B5A0" strokeWidth="0.8" opacity="0.5" />
        <line x1="68" y1="110" x2="78" y2="111" stroke="#C4B5A0" strokeWidth="0.8" opacity="0.5" />

        {/* Heart */}
        <path
          d="M65 78 C65 74, 60 71, 57 74 C54 71, 49 74, 49 78 C49 84, 57 90, 57 90 C57 90, 65 84, 65 78Z"
          fill="#E8735A"
          opacity="0.4"
        />
      </svg>
    </motion.div>
  );
}

/* ── Chat Icon ── */
function ChatIcon() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      className="flex items-center justify-center"
    >
      <div className="w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center">
        <MessageCircle size={42} className="text-coral" strokeWidth={1.5} />
      </div>
    </motion.div>
  );
}

/* ── Landing Hub ── */
export default function LandingHub() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header — slide down */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-warm-brown/8"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg text-warm-brown font-semibold">
            {"\ud83c\udffa"} ObeseTalk
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/jar"
              className="font-sans text-xs text-warm-brown/50 hover:text-coral transition-colors"
            >
              🏺 The Jar
            </Link>
            <Link
              href="/chat"
              className="font-sans text-xs text-coral font-medium hover:text-coral-dark transition-colors"
            >
              💬 Chat
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        {/* Hero title — staggered word reveal */}
        <motion.h1
          className="font-serif text-2xl md:text-4xl text-warm-brown mb-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {"Welcome to ObeseTalk".split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: 0.3 + i * 0.12,
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
          className="font-sans text-warm-brown/60 text-sm md:text-base max-w-md mx-auto mb-10 md:mb-14 text-center px-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          A place built with love, for people who deserve better.
        </motion.p>

        {/* Product Cards Grid — future-proof with auto-fit */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.0 + i * 0.15,
                duration: 0.6,
                ease: "easeOut",
              }}
            >
              <Link href={product.href} className="block group">
                <motion.div
                  className="bg-white rounded-2xl border border-warm-brown/8 p-8 md:p-10 text-center transition-all duration-300 hover:border-coral/30 hover:shadow-lg h-full"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    {product.icon === "jar" ? <JarIcon /> : <ChatIcon />}
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-xl md:text-2xl text-warm-brown font-semibold group-hover:text-coral transition-colors mb-3">
                    {product.title}
                  </h2>

                  {/* Description */}
                  <p className="font-sans text-sm text-warm-brown/60 leading-relaxed mb-5 max-w-xs mx-auto">
                    {product.description}
                  </p>

                  {/* CTA */}
                  <span className="inline-flex items-center gap-1.5 font-sans text-sm text-coral font-medium group-hover:text-coral-dark transition-colors">
                    {product.cta}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
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
    </div>
  );
}
