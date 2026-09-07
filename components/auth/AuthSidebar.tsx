"use client";

import { usePathname } from "next/navigation";
import { Mascot } from "@/components/ui/mascot";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const tips = [
  "Track your daily caffeine expenses... they add up!",
  "A budget is telling your money where to go instead of wondering where it went.",
  "Set aside a little each month for unexpected vet bills (or your own).",
  "Review your subscriptions. Still using that streaming service?",
];

export function AuthSidebar() {
  const pathname = usePathname();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  let pose: "wave" | "idle" | "sleeping" | "celebrate" | "confused" = "idle";
  if (pathname === "/login") pose = "wave";
  else if (pathname === "/signup") pose = "idle";
  else if (pathname?.includes("password")) pose = "sleeping";
  else if (pathname === "/onboarding") pose = "celebrate";

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto gap-4 lg:gap-8 text-center h-full">
      <div className="flex h-32 w-32 lg:h-48 lg:w-48 items-center justify-center rounded-3xl bg-oreo-lavender shadow-oreo-sm">
        <Mascot key={pose} pose={pose} className="h-24 w-24 lg:h-40 lg:w-40 drop-shadow-lg" />
      </div>
      <div className="hidden lg:block space-y-4">
        <h2 className="font-heading text-3xl font-semibold text-oreo-slate-purple">
          Oreo Finance
        </h2>
        <div className="h-20 relative w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-oreo-slate-purple/80 absolute w-full font-medium"
            >
              "{tips[tipIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
