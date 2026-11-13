"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { animate, useInView, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = "",
  decimals = 2,
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const hasAnimated = React.useRef(false);
  // Imperative animate() ignores MotionConfig, so honour Reduce Motion here.
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!ref.current || !inView) return;
    
    // Only animate from 0 on first mount/view. Subsequent value changes can animate from the current value.
    const startValue = hasAnimated.current ? parseFloat(ref.current.textContent?.replace(/[^0-9.-]+/g, "") || "0") : 0;
    hasAnimated.current = true;

    const controls = animate(startValue, value, {
      ...(reduceMotion ? { duration: 0 } : spring.smooth),
      onUpdate(latest) {
        if (ref.current) {
          // Format with commas and exact decimals
          const formatted = latest.toLocaleString("en", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
          ref.current.textContent = `${prefix}${formatted}`;
        }
      },
    });

    return controls.stop;
  }, [value, inView, prefix, decimals, reduceMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}{(0).toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
