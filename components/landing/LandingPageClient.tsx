"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PieChart, Shield, Smartphone, Heart, PawPrint } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";

export function LandingPageClient({ user }: { user: any }) {
  const prefersReducedMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(true); 
  const [mounted, setMounted] = useState(false);
  
  const { scrollY } = useScroll();
  const headerBgOpacity = useTransform(scrollY, [0, 50], [0, 0.8]);
  const headerShadow = useTransform(scrollY, [0, 50], ["none", "0 4px 24px rgba(86,86,118,0.08)"]);
  const headerBorder = useTransform(scrollY, [0, 50], ["transparent", "rgba(var(--border), 0.5)"]);

  // Custom Cursor state
  const cursorX = useSpring(0, { stiffness: 300, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 300, damping: 28 });
  const cursorRingX = useSpring(0, { stiffness: 150, damping: 20 });
  const cursorRingY = useSpring(0, { stiffness: 150, damping: 20 });

  // Parallax mascot eyes/head state
  const mouseX = useSpring(0, { stiffness: 200, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 200, damping: 30 });
  
  // Odometer state
  const [balance, setBalance] = useState(1204.50);

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      cursorRingX.set(e.clientX);
      cursorRingY.set(e.clientY);
      
      // Normalize for parallax (-1 to 1)
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY, cursorRingX, cursorRingY, mouseX, mouseY]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => {
        if (prev === 1204.50) return 3880.12;
        if (prev === 3880.12) return 5100.00;
        return 1204.50;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleConfetti = () => {
    if (prefersReducedMotion) return;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#565676', '#d8dcff', '#9797b8']
    });
  };

  const showCustomCursor = !isTouch && !prefersReducedMotion;

  return (
    <div className={`flex flex-col min-h-screen bg-background ${showCustomCursor ? "cursor-none" : ""}`}>
      {/* Custom Cursor */}
      {showCustomCursor && (
        <>
          <motion.div 
            className="fixed top-0 left-0 w-3 h-3 bg-oreo-periwinkle rounded-full pointer-events-none z-[100]"
            style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
          />
          <motion.div 
            className="fixed top-0 left-0 w-8 h-8 border-2 border-oreo-slate-purple/30 rounded-full pointer-events-none z-[99]"
            style={{ x: cursorRingX, y: cursorRingY, translateX: "-50%", translateY: "-50%" }}
          />
        </>
      )}

      {/* Sticky Nav */}
      <motion.header 
        className="flex h-20 items-center justify-between px-6 md:px-12 sticky top-0 z-50 transition-colors"
        style={{ 
          backgroundColor: useTransform(headerBgOpacity, opacity => `rgba(255, 255, 255, ${opacity})`), 
          backdropFilter: useTransform(scrollY, y => y > 10 ? "blur(12px)" : "none"),
          boxShadow: headerShadow,
          borderBottom: useTransform(headerBorder, border => `1px solid ${border}`)
        }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/oreo.svg"
            alt="Oreo Mascot"
            width={36}
            height={36}
            className="h-9 w-9"
            style={{ imageRendering: "pixelated" }}
          />
          <span className="font-heading text-2xl font-bold tracking-tight text-oreo-slate-purple">
            Oreo
          </span>
        </div>
        <nav>
          {user ? (
            <Link href="/dashboard" className={showCustomCursor ? "cursor-none" : ""}>
              <Button className={`gap-2 shadow-oreo-sm hover:-translate-y-0.5 hover:shadow-oreo-md transition-all ${showCustomCursor ? "cursor-none" : ""}`}>
                Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login" className={showCustomCursor ? "cursor-none" : ""}>
              <Button className={`gap-2 shadow-oreo-sm hover:-translate-y-0.5 hover:shadow-oreo-md transition-all ${showCustomCursor ? "cursor-none" : ""}`}>
                Get Started
              </Button>
            </Link>
          )}
        </nav>
      </motion.header>

      <main className="flex-1 flex flex-col items-center relative overflow-hidden">
        {/* Blob Background */}
        {mounted && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
            <motion.div 
              className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-oreo-lavender blur-3xl mix-blend-multiply"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-oreo-periwinkle blur-3xl mix-blend-multiply"
              animate={{
                x: [0, -80, 0],
                y: [0, 120, 0],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        {/* Hero Section */}
        <section className="relative z-10 w-full max-w-6xl px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="flex-1 space-y-6">
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-oreo-slate-purple leading-[1.1]">
              Personal finance, <br className="hidden md:block"/>
              purr-fectly tracked.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Track your income, expenses, and transfers across multiple accounts and currencies. Meet Oreo, your playful companion to financial clarity.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              {user ? (
                <Link href="/dashboard" className={showCustomCursor ? "cursor-none" : ""}>
                  <Button size="lg" className={`h-14 px-8 text-lg font-medium shadow-oreo-sm hover:-translate-y-0.5 hover:shadow-oreo-md transition-all duration-300 w-full sm:w-auto ${showCustomCursor ? "cursor-none" : ""}`}>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className={showCustomCursor ? "cursor-none" : ""}>
                  <Button size="lg" className={`h-14 px-8 text-lg font-medium shadow-oreo-sm hover:-translate-y-0.5 hover:shadow-oreo-md transition-all duration-300 w-full sm:w-auto ${showCustomCursor ? "cursor-none" : ""}`}>
                    Start tracking for free
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center w-full max-w-md md:max-w-none perspective-1000">
            <motion.div 
              className="relative w-full aspect-square max-w-[400px] rounded-3xl bg-oreo-lavender/30 border border-oreo-periwinkle/20 flex flex-col items-center justify-center overflow-hidden shadow-oreo-lg"
              style={{
                rotateX: useTransform(mouseY, [-1, 1], [5, -5]),
                rotateY: useTransform(mouseX, [-1, 1], [-5, 5]),
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-oreo-slate-purple/5 to-transparent pointer-events-none" />
              
              {/* Odometer Balance */}
              <div className="mb-6 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-border/50">
                <span className="font-mono text-3xl font-bold tracking-tight text-foreground flex items-center">
                  $
                  <motion.span 
                    key={balance}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                    className="inline-block ml-1"
                  >
                    {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </motion.span>
                </span>
              </div>
              
              {/* Mascot */}
              <motion.div
                style={{
                  x: useTransform(mouseX, [-1, 1], [-8, 8]),
                  y: useTransform(mouseY, [-1, 1], [-8, 8]),
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/oreo.svg"
                    alt="Oreo Mascot"
                    width={200}
                    height={200}
                    className="w-48 h-48 drop-shadow-xl"
                    style={{ imageRendering: "pixelated" }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 w-full bg-oreo-periwinkle/5 py-24 px-6 border-t border-border/50">
          <div className="max-w-6xl mx-auto space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4 max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-oreo-slate-purple">
                Everything you need to manage your money
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple, beautiful, and powerful tools designed to help you understand your spending habits.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: PieChart,
                  title: "Smart Budgeting",
                  description: "Set budgets for categories and track your progress throughout the month."
                },
                {
                  icon: Shield,
                  title: "Secure & Private",
                  description: "Your financial data is encrypted and secure. We never sell your data."
                },
                {
                  icon: Smartphone,
                  title: "Works Everywhere",
                  description: "Install Oreo as a PWA on your phone or use it seamlessly on the web."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border shadow-oreo-sm hover:shadow-oreo-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-full bg-oreo-lavender/50 text-oreo-slate-purple flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    <PawPrint className="w-4 h-4 inline-block mr-2 text-oreo-slate-purple/50" />
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="relative z-10 w-full py-32 px-6 bg-gradient-to-b from-background to-oreo-lavender/20 flex flex-col items-center text-center space-y-8">
          <Image
            src="/oreo.svg"
            alt="Oreo Mascot"
            width={80}
            height={80}
            className="w-20 h-20 drop-shadow-md mb-4"
            style={{ imageRendering: "pixelated" }}
          />
          <h2 className="font-heading text-4xl font-bold text-oreo-slate-purple">Ready to meet Oreo?</h2>
          <Button 
            size="lg" 
            onClick={handleConfetti}
            className={`h-14 px-10 text-lg font-medium shadow-oreo-sm hover:-translate-y-0.5 hover:shadow-oreo-md transition-all ${showCustomCursor ? "cursor-none" : ""}`}
          >
            Start Tracking Free
          </Button>
        </section>
      </main>

      <footer className="w-full py-8 text-center text-sm text-muted-foreground border-t border-border/50 relative z-10 bg-background">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} Oreo Finance. Built with <Heart className="w-4 h-4 text-rose-500 fill-current" /> for a cat named Oreo.
        </p>
      </footer>
    </div>
  );
}
