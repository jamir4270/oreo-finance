"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export function FakeSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Dismiss shortly after mount to let hydration settle
    const timer = setTimeout(() => setShow(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[50] bg-[#d8dcff] flex items-center justify-center pointer-events-none"
        >
          <Image
            src="/oreo.svg"
            alt="Oreo Splash"
            width={200}
            height={200}
            className="w-48 h-48 drop-shadow-xl"
            style={{ imageRendering: "pixelated" }}
            priority
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
