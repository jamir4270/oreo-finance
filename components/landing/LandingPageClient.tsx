"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/* ─── Ledger row data (USD) ─── */
const LEDGER_ROWS = [
  {
    emoji: "🛒",
    dotBg: "#fbe3e6",
    name: "Groceries",
    sub: "Today · Cash",
    amount: "-120.00",
    type: "expense" as const,
  },
  {
    emoji: "💰",
    dotBg: "#dff2ef",
    name: "Salary",
    sub: "Yesterday · Bank",
    amount: "+3,200.00",
    type: "income" as const,
  },
  {
    emoji: "✈️",
    dotBg: "#eceafd",
    name: "Hotel, Tokyo",
    sub: "Jun 2 · converted from ¥18,400",
    amount: "-128.50",
    type: "expense" as const,
  },
];

export function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  /* ── Scroll-driven nav ── */
  const { scrollY } = useScroll();
  const navBgOpacity = useTransform(scrollY, [0, 50], [0, 0.85]);
  const navBlur = useTransform(scrollY, [0, 50], [0, 10]);
  const navBorderOpacity = useTransform(scrollY, [0, 50], [0, 0.08]);

  /* ── Browser frame 3D tilt ── */
  const frameRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frameTilt, setFrameTilt] = useState({ rY: -8, rX: 4 });

  /* ── Ledger stagger ── */
  const [rowsVisible, setRowsVisible] = useState<boolean[]>(
    LEDGER_ROWS.map(() => false)
  );

  useEffect(() => {
    setMounted(true);

    /* stagger ledger rows in on load */
    LEDGER_ROWS.forEach((_, i) => {
      setTimeout(
        () =>
          setRowsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          }),
        500 + i * 180
      );
    });
  }, []);

  /* Mouse-tilt handler for the browser frame */
  const handleFrameMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setFrameTilt({ rY: -8 + x * 12, rX: 4 - y * 10 });
  };

  const handleFrameMouseLeave = () => {
    setFrameTilt({ rY: -8, rX: 4 });
  };

  const ctaHref = isLoggedIn ? "/dashboard" : "/login";
  const ctaLabel = isLoggedIn ? "Go to Dashboard" : "Start tracking free";

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f6ff] text-[#3d3d5c] font-sans antialiased overflow-x-hidden">
      {/* ════════════════════════ NAV ════════════════════════ */}
      <motion.nav
        className="sticky top-0 z-50 flex items-center justify-between px-7 py-5 transition-colors"
        style={{
          backgroundColor: useTransform(
            navBgOpacity,
            (o) => `rgba(251,251,255,${o})`
          ),
          backdropFilter: useTransform(navBlur, (b) => `blur(${b}px)`),
          borderBottom: useTransform(
            navBorderOpacity,
            (o) => `1px solid rgba(86,86,118,${o})`
          ),
        }}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/oreo.svg"
            alt="Oreo Mascot"
            width={30}
            height={30}
            className="w-[30px] h-[30px]"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="font-heading text-xl font-semibold text-[#3d3d5c]">
            Oreo
          </span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="#how"
            className="hidden md:inline text-sm font-medium text-[#3d3d5c] opacity-75 hover:opacity-100 transition-opacity no-underline"
          >
            How it works
          </a>
          <a
            href="#features"
            className="hidden md:inline text-sm font-medium text-[#3d3d5c] opacity-75 hover:opacity-100 transition-opacity no-underline"
          >
            Features
          </a>
          {!isLoggedIn && (
            <Link
              href="/login"
              className="hidden md:inline text-sm font-medium text-[#3d3d5c] opacity-75 hover:opacity-100 transition-opacity no-underline"
            >
              Log in
            </Link>
          )}
          <Link href={ctaHref}>
            <button className="inline-flex items-center gap-2 px-5 py-[11px] rounded-[11px] font-semibold text-sm bg-[#3d3d5c] text-white border-none cursor-pointer shadow-[0_6px_18px_rgba(61,61,92,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(61,61,92,0.34)] active:scale-[0.97]">
              {isLoggedIn ? "Dashboard" : "Get started"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative">
        {/* Blob */}
        <div
          className="absolute top-[-140px] right-[-160px] w-[520px] h-[520px] rounded-full opacity-55 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #aeadf0, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center max-w-[1120px] mx-auto px-7 pt-16 pb-10">
          {/* Left copy */}
          <div className="relative z-10">
            <p className="text-sm text-[#565676] opacity-80 mb-3.5">
              Your own personal feline financial partner. Built for real money.
            </p>
            <h1 className="font-heading text-[clamp(38px,5vw,52px)] leading-[1.05] font-semibold text-[#3d3d5c] tracking-[-0.5px] mb-5">
              See where your
              <br />
              money actually went.
            </h1>
            <p className="text-[17px] leading-[1.6] text-[#5b5b78] max-w-[440px] mb-7">
              Log expenses, income, and transfers across every account and
              currency you use. Oreo handles the converting and the adding so
              your dashboard is never a guess.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href={ctaHref}>
                <button className="inline-flex items-center gap-2 px-5 py-[11px] rounded-[11px] font-semibold text-sm bg-[#3d3d5c] text-white border-none cursor-pointer shadow-[0_6px_18px_rgba(61,61,92,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(61,61,92,0.34)] active:scale-[0.97]">
                  {ctaLabel}
                </button>
              </Link>
            </div>
          </div>

          {/* Right — Browser frame */}
          <div
            ref={wrapRef}
            className="relative z-10"
            style={{ perspective: "1400px" }}
            onMouseMove={handleFrameMouseMove}
            onMouseLeave={handleFrameMouseLeave}
          >
            <div
              ref={frameRef}
              className="bg-[#fbfbff] rounded-[20px] overflow-hidden relative"
              style={{
                boxShadow:
                  "0 30px 70px -20px rgba(61,61,92,0.35), 0 10px 24px -8px rgba(61,61,92,0.18)",
                transform: `rotateY(${frameTilt.rY}deg) rotateX(${frameTilt.rX}deg) rotate(-1.5deg)`,
                transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* Bite mark */}
              <div
                className="absolute top-[-1px] right-[-1px] w-14 h-14 bg-[#f5f6ff] rounded-full z-10"
                style={{ transform: "translate(28px,-28px)" }}
              />

              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#eeeffb] border-b border-[rgba(86,86,118,0.08)]">
                <span className="w-[9px] h-[9px] rounded-full bg-[#d6d6ea]" />
                <span className="w-[9px] h-[9px] rounded-full bg-[#d6d6ea]" />
                <span className="w-[9px] h-[9px] rounded-full bg-[#d6d6ea]" />
              </div>

              {/* App body */}
              <div className="px-[22px] py-[22px] pb-[26px]">
                <div className="text-[11px] text-[#8888a6] mb-1">
                  Total balance
                </div>
                <div className="text-[34px] font-semibold text-[#3d3d5c] mb-[18px] font-heading">
                  $4,231
                  <span className="text-[20px] text-[#9c9cb8]">.85</span>
                </div>

                {/* Ledger rows — staggered in */}
                {LEDGER_ROWS.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-[11px] rounded-[11px] bg-[#f6f6ff] mb-2 transition-all duration-500"
                    style={{
                      opacity: rowsVisible[i] ? 1 : 0,
                      transform: rowsVisible[i]
                        ? "translateY(0)"
                        : "translateY(10px)",
                      transitionTimingFunction:
                        "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm"
                        style={{ background: row.dotBg }}
                      >
                        {row.emoji}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium text-[#3d3d5c]">
                          {row.name}
                        </div>
                        <div className="text-[11px] text-[#9c9cb8]">
                          {row.sub}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-mono text-[13.5px] font-semibold ${
                        row.type === "expense"
                          ? "text-[#a76571]"
                          : "text-[#5f8f8a]"
                      }`}
                    >
                      {row.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ INK BAND ════════════════════════ */}
      <section className="bg-[#3d3d5c] text-white py-[90px] px-7 mt-10 text-center">
        <p className="text-sm text-[#c7c7e8] mb-4">
          the number that actually matters
        </p>
        <div className="font-mono font-bold text-[clamp(48px,9vw,104px)] tracking-[-2px] leading-none text-white mb-[18px]">
          <span className="text-[#aeadf0]">$</span>4,231.85
        </div>
        <p className="text-[#b9b9dc] max-w-[480px] mx-auto text-[15px] leading-[1.6]">
          Converted live across every currency you hold. Not what you think is
          in there, what&apos;s actually in there.
        </p>
      </section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section id="how" className="max-w-[1120px] mx-auto px-7 pt-[100px] pb-[60px]">
        <div className="max-w-[520px] mb-14">
          <h2 className="font-heading text-[34px] font-semibold text-[#3d3d5c] mb-3">
            Three steps. That&apos;s the whole system.
          </h2>
          <p className="text-[#5b5b78] text-base leading-[1.6]">
            No linked bank accounts, no automated guessing. You log it, Oreo
            organizes it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Step 01 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0,
            }}
            className="pt-1.5"
          >
            <span className="inline-block font-mono font-bold text-sm text-[#565676] bg-[#d8dcff] px-2.5 py-1 rounded-lg mb-[18px]">
              01
            </span>
            <h3 className="font-heading text-[19px] font-semibold text-[#3d3d5c] mb-2">
              Log it
            </h3>
            <p className="text-[14.5px] text-[#6b6b88] leading-[1.6] mb-[18px]">
              Expense, income, or transfer, in whatever currency you actually
              paid in.
            </p>
            <div className="bg-[#fbfbff] rounded-[14px] p-3.5 shadow-[0_10px_26px_-12px_rgba(61,61,92,0.22)]">
              <div className="flex items-center justify-between py-[7px] text-[12.5px]">
                <span>Amount</span>
                <span className="font-mono">$40.00</span>
              </div>
              <div className="flex items-center justify-between py-[7px] text-[12.5px] border-t border-dashed border-[#e2e2f2]">
                <span>Account</span>
                <span className="text-[11px] font-semibold bg-[#d8dcff] text-[#565676] px-2 py-[3px] rounded-full">
                  Travel Wallet
                </span>
              </div>
            </div>
          </motion.div>

          {/* Step 02 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.12,
            }}
            className="pt-1.5"
          >
            <span className="inline-block font-mono font-bold text-sm text-[#565676] bg-[#d8dcff] px-2.5 py-1 rounded-lg mb-[18px]">
              02
            </span>
            <h3 className="font-heading text-[19px] font-semibold text-[#3d3d5c] mb-2">
              Categorize
            </h3>
            <p className="text-[14.5px] text-[#6b6b88] leading-[1.6] mb-[18px]">
              Pick from a curated icon set, or let your defaults do the sorting.
            </p>
            <div className="bg-[#fbfbff] rounded-[14px] p-3.5 shadow-[0_10px_26px_-12px_rgba(61,61,92,0.22)]">
              <div className="flex items-center justify-between py-[7px] text-[12.5px]">
                <span>🍜 Dining</span>
                <span className="text-[11px] font-semibold bg-[#d8dcff] text-[#565676] px-2 py-[3px] rounded-full">
                  Expense
                </span>
              </div>
              <div className="flex items-center justify-between py-[7px] text-[12.5px] border-t border-dashed border-[#e2e2f2]">
                <span>🚕 Transport</span>
                <span className="text-[11px] font-semibold bg-[#d8dcff] text-[#565676] px-2 py-[3px] rounded-full">
                  Expense
                </span>
              </div>
            </div>
          </motion.div>

          {/* Step 03 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.24,
            }}
            className="pt-1.5"
          >
            <span className="inline-block font-mono font-bold text-sm text-[#565676] bg-[#d8dcff] px-2.5 py-1 rounded-lg mb-[18px]">
              03
            </span>
            <h3 className="font-heading text-[19px] font-semibold text-[#3d3d5c] mb-2">
              Watch it roll up
            </h3>
            <p className="text-[14.5px] text-[#6b6b88] leading-[1.6] mb-[18px]">
              Every account, every currency, converted into one honest total.
            </p>
            <div className="bg-[#fbfbff] rounded-[14px] p-3.5 shadow-[0_10px_26px_-12px_rgba(61,61,92,0.22)]">
              <div className="flex items-center justify-between py-[7px] text-[12.5px]">
                <span>USD wallet</span>
                <span className="font-mono">$1,200.40</span>
              </div>
              <div className="flex items-center justify-between py-[7px] text-[12.5px] border-t border-dashed border-[#e2e2f2]">
                <span>JPY savings</span>
                <span className="font-mono">$3,031.45</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ FEATURES (RECEIPT CARDS) ════════════════════════ */}
      <section
        id="features"
        className="max-w-[1120px] mx-auto px-7 pt-[60px] pb-[110px]"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-6">
          {/* Left stack */}
          <div className="flex flex-col gap-6">
            {/* Receipt: Budgets */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-[#fbfbff] rounded-t-[18px] rounded-b-none px-7 pt-[30px] pb-[34px] shadow-[0_16px_36px_-18px_rgba(61,61,92,0.24)]"
            >
              {/* Torn edge */}
              <div
                className="absolute left-0 right-0 bottom-[-9px] h-[18px]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #f5f6ff 50%, transparent 50%), linear-gradient(45deg, #f5f6ff 50%, transparent 50%)",
                  backgroundSize: "18px 18px",
                  backgroundRepeat: "repeat-x",
                }}
              />
              <div className="w-[34px] h-1 rounded-[3px] bg-[#565676] mb-[18px]" />
              <h3 className="font-heading text-xl font-semibold text-[#3d3d5c] mb-2.5">
                Budgets that remember last month
              </h3>
              <p className="text-[14.5px] text-[#6b6b88] leading-[1.65]">
                Come in under budget and the leftover rolls into next period
                automatically. Go over, and next period tightens to match. No
                manual math either way.
              </p>
            </motion.div>

            {/* Receipt: Multi-currency */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
              className="relative bg-[#fbfbff] rounded-t-[18px] rounded-b-none px-7 pt-[30px] pb-[34px] shadow-[0_16px_36px_-18px_rgba(61,61,92,0.24)]"
            >
              <div
                className="absolute left-0 right-0 bottom-[-9px] h-[18px]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #f5f6ff 50%, transparent 50%), linear-gradient(45deg, #f5f6ff 50%, transparent 50%)",
                  backgroundSize: "18px 18px",
                  backgroundRepeat: "repeat-x",
                }}
              />
              <div className="w-[34px] h-1 rounded-[3px] bg-[#a76571] mb-[18px]" />
              <h3 className="font-heading text-xl font-semibold text-[#3d3d5c] mb-2.5">
                Multi-currency without the mental math
              </h3>
              <p className="text-[14.5px] text-[#6b6b88] leading-[1.65]">
                Got paid in a currency your account doesn&apos;t use? Enter it
                as-is. Oreo converts it at the day&apos;s rate and shows you
                both numbers.
              </p>
            </motion.div>
          </div>

          {/* Right — tall receipt */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15,
            }}
            className="relative bg-[#fbfbff] rounded-t-[18px] rounded-b-none px-7 pt-[30px] pb-[34px] shadow-[0_16px_36px_-18px_rgba(61,61,92,0.24)] min-h-full flex flex-col"
          >
            <div
              className="absolute left-0 right-0 bottom-[-9px] h-[18px]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f5f6ff 50%, transparent 50%), linear-gradient(45deg, #f5f6ff 50%, transparent 50%)",
                backgroundSize: "18px 18px",
                backgroundRepeat: "repeat-x",
              }}
            />
            <div className="w-[34px] h-1 rounded-[3px] bg-[#5f8f8a] mb-[18px]" />
            <h3 className="font-heading text-xl font-semibold text-[#3d3d5c] mb-2.5">
              Install it. Forget it&apos;s a website.
            </h3>
            <p className="text-[14.5px] text-[#6b6b88] leading-[1.65]">
              Add Oreo to your home screen on any phone or desktop. Same ledger,
              same budgets, no app store.
            </p>
            <div className="font-mono text-[30px] font-bold text-[#3d3d5c] mt-3.5 mb-1">
              2 taps
            </div>
            <p className="text-[12.5px] text-[#9c9cb8]">
              from browser to home screen
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ WARM NOTE ════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-7 pb-[100px] text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[17px] leading-[1.7] text-[#5b5b78]"
        >
          Oreo is designed to feel like a{" "}
          <strong className="text-[#3d3d5c] font-semibold">
            warm, competent friend
          </strong>{" "}
          helping you track money. Soft on the outside, serious about the
          numbers on the inside. The kind of app you actually want to open
          every day.
        </motion.p>
      </section>

      {/* ════════════════════════ FINAL CTA ════════════════════════ */}
      <section
        className="relative px-7 pt-[100px] pb-[120px] text-center"
        style={{
          background:
            "linear-gradient(180deg, #f5f6ff, #d8dcff 120%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <Image
            src="/oreo.svg"
            alt="Oreo Mascot"
            width={76}
            height={76}
            className="w-[76px] h-[76px] mb-[22px]"
            style={{ imageRendering: "pixelated" }}
          />
          <h2 className="font-heading text-[38px] font-semibold text-[#3d3d5c] mb-7">
            Ready to meet Oreo?
          </h2>
          <Link href={ctaHref}>
            <button className="inline-flex items-center gap-2 px-8 py-[15px] rounded-[11px] font-semibold text-base bg-[#3d3d5c] text-white border-none cursor-pointer shadow-[0_6px_18px_rgba(61,61,92,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(61,61,92,0.34)] active:scale-[0.97]">
              {ctaLabel}
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer className="py-9 text-center text-[13px] text-[#8888a6] border-t border-[rgba(86,86,118,0.08)]">
        <p className="flex items-center justify-center gap-1.5">
          © {new Date().getFullYear()} Oreo Finance. A personal project.
          {!isLoggedIn && (
            <Link
              href="/login"
              className="text-inherit hover:text-[#565676] transition-colors ml-2"
            >
              Log in
            </Link>
          )}
        </p>
      </footer>
    </div>
  );
}
