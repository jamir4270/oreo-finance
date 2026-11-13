"use client";

import * as React from "react";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  /** Unique per page so two controls don't share a sliding thumb */
  id: string;
  className?: string;
}

/** iOS UISegmentedControl: grey track, white thumb that slides between segments. */
export function SegmentedControl<T extends string>({ value, onChange, options, id, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" className={cn("flex rounded-[9px] bg-foreground/[0.07] p-[2px]", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex h-8 flex-1 items-center justify-center text-[13px] transition-colors",
              selected ? "font-semibold text-foreground" : "font-medium text-foreground/70 active:text-foreground/40"
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segment-thumb-${id}`}
                transition={spring.snappy}
                className="absolute inset-0 rounded-[7px] bg-card shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
