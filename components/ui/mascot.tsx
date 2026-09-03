"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "motion/react";

interface MascotProps {
  pose?: "idle" | "wave" | "celebrate" | "sleeping" | "confused";
  className?: string;
}

export function Mascot({ pose = "idle", className }: MascotProps) {
  const variants: Variants = {
    idle: {
      y: [0, -4, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    wave: {
      rotate: [0, 15, -10, 15, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    celebrate: {
      y: [0, -15, 0],
      scale: [1, 1.15, 1],
      transition: {
        duration: 0.6,
        repeat: 3,
        ease: "easeInOut",
      },
    },
    sleeping: {
      y: [0, 3, 0],
      scaleY: [1, 0.95, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    confused: {
      x: [-3, 3, -3, 3, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      animate={pose}
      className={cn("relative flex items-center justify-center", className)}
    >
      <Image
        src="/oreo.svg"
        alt={`Oreo Mascot - ${pose}`}
        width={64}
        height={64}
        className="h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </motion.div>
  );
}
