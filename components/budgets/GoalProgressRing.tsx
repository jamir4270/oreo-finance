"use client";

import React from "react";
import { motion } from "motion/react";

interface GoalProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}

export function GoalProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "var(--color-oreo-slate-purple)",
  backgroundColor = "var(--color-oreo-lavender)",
}: GoalProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = Math.max(0, circumference - (progress / 100) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-heading">
        <span className="text-xl font-bold text-oreo-slate-purple">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
