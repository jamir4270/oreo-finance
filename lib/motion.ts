import type { Transition } from "motion/react";

/**
 * iOS-style springs. UIKit motion is spring-based and critically damped for chrome
 * (no bounce); bounce is reserved for moments of delight.
 * visualDuration = time to visually settle, so springs feel as fast as the old tweens.
 */
export const spring = {
  /** Taps, toggles, small state changes */
  snappy: { type: "spring", visualDuration: 0.25, bounce: 0 },
  /** Sheets, cards, progress fills, page-level movement */
  smooth: { type: "spring", visualDuration: 0.45, bounce: 0 },
  /** Celebrations only (goal reached, streaks) */
  bouncy: { type: "spring", visualDuration: 0.5, bounce: 0.25 },
} as const satisfies Record<string, Transition>;
