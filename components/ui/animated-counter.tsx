"use client";

import * as React from "react";
import { animate, useInView } from "motion/react";

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

  React.useEffect(() => {
    if (!ref.current || !inView) return;
    
    // Only animate from 0 on first mount/view. Subsequent value changes can animate from the current value.
    const startValue = hasAnimated.current ? parseFloat(ref.current.textContent?.replace(/[^0-9.-]+/g, "") || "0") : 0;
    hasAnimated.current = true;

    const controls = animate(startValue, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // ease-oreo
      onUpdate(latest) {
        if (ref.current) {
          // Format with commas and exact decimals
          const formatted = latest.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
          ref.current.textContent = `${prefix}${formatted}`;
        }
      },
    });

    return controls.stop;
  }, [value, inView, prefix, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{(0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}
