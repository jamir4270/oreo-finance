"use client";

import { cn } from "@/lib/utils";
import { motion, type Variants } from "motion/react";

interface MascotProps {
  pose?: "idle" | "wave" | "celebrate" | "sleeping" | "confused";
  className?: string;
}

export function Mascot({ pose = "idle", className }: MascotProps) {
  // We will animate the entire container and some inner parts
  const containerVariants: Variants = {
    idle: {
      y: [0, -4, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    wave: {
      rotate: [0, 15, -10, 15, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
    celebrate: {
      y: [0, -15, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.6, repeat: 3, ease: "easeInOut" },
    },
    sleeping: {
      y: [0, 3, 0],
      scaleY: [1, 0.95, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    confused: {
      x: [-3, 3, -3, 3, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const earLeftVariants: Variants = {
    idle: { rotate: [0, -5, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
    wave: { rotate: [0, -10, 0], transition: { duration: 1, repeat: Infinity } },
    sleeping: { rotate: -15, y: 2 },
    confused: { rotate: -20 },
  };

  const earRightVariants: Variants = {
    idle: { rotate: [0, 5, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 } },
    wave: { rotate: [0, 10, 0], transition: { duration: 1, repeat: Infinity } },
    sleeping: { rotate: 15, y: 2 },
    confused: { rotate: 20 },
  };

  const eyesVariants: Variants = {
    idle: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] } },
    sleeping: { scaleY: 0.1 },
    celebrate: { scaleY: [1, 0.2, 1], transition: { duration: 0.6, repeat: Infinity } },
    confused: { scaleY: [1, 0.5, 1] },
  };

  const tailVariants: Variants = {
    idle: { rotate: [0, 15, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    wave: { rotate: [0, 30, 0], transition: { duration: 0.8, repeat: Infinity } },
    sleeping: { rotate: -20 },
    celebrate: { rotate: [0, 45, 0], transition: { duration: 0.5, repeat: Infinity } },
  };

  return (
    <motion.div
      variants={containerVariants}
      animate={pose}
      className={cn("relative flex items-center justify-center text-oreo-slate-purple", className)}
    >
      <motion.svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        style={{ overflow: "visible" }}
      >
        {/* Tail */}
        <motion.path
          variants={tailVariants}
          style={{ originX: "16px", originY: "48px" }}
          d="M 20 48 Q 4 48 4 32"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <path d="M 16 32 C 16 12 48 12 48 32 C 48 52 16 52 16 32 Z" fill="currentColor" />

        {/* Left Ear */}
        <motion.path
          variants={earLeftVariants}
          style={{ originX: "24px", originY: "24px" }}
          d="M 14 26 L 16 10 L 28 20 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Right Ear */}
        <motion.path
          variants={earRightVariants}
          style={{ originX: "40px", originY: "24px" }}
          d="M 50 26 L 48 10 L 36 20 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Face */}
        <motion.g variants={eyesVariants} style={{ originX: "32px", originY: "32px" }}>
          {/* Left Eye */}
          <circle cx="26" cy="30" r="3.5" fill="#FFF" />
          {/* Right Eye */}
          <circle cx="38" cy="30" r="3.5" fill="#FFF" />
        </motion.g>

        {/* Nose */}
        <path d="M 30 36 L 34 36 L 32 39 Z" fill="#FFAEC9" />

        {/* Whiskers */}
        <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5">
          <line x1="20" y1="36" x2="10" y2="34" />
          <line x1="20" y1="38" x2="10" y2="38" />
          <line x1="44" y1="36" x2="54" y2="34" />
          <line x1="44" y1="38" x2="54" y2="38" />
        </g>
      </motion.svg>
    </motion.div>
  );
}
