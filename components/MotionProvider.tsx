"use client";

import { MotionConfig } from "motion/react";

/** Honors the OS "Reduce Motion" setting for every Motion animation in the app. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
