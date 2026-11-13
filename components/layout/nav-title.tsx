"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * iOS large-title navigation: the page's big title scrolls with content; once it
 * passes under the top bar, the bar shows a small centred title and its hairline.
 */

type NavTitleState = { title: string | null; collapsed: boolean };
type NavTitleSetters = {
  setTitle: (title: string | null) => void;
  setCollapsed: (collapsed: boolean) => void;
};

const StateContext = React.createContext<NavTitleState>({ title: null, collapsed: false });
const SettersContext = React.createContext<NavTitleSetters | null>(null);

export function NavTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState<string | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const setters = React.useMemo(() => ({ setTitle, setCollapsed }), []);
  return (
    <SettersContext.Provider value={setters}>
      <StateContext.Provider value={{ title, collapsed }}>{children}</StateContext.Provider>
    </SettersContext.Provider>
  );
}

export const useNavTitle = () => React.useContext(StateContext);

/** Marks the element the large title collapses under (the mobile top bar). */
export const NAV_BAR_ATTR = "data-nav-bar";

export function PageTitle({ children, className }: { children: string; className?: string }) {
  const setters = React.useContext(SettersContext);
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (!setters) return;
    const { setTitle, setCollapsed } = setters;
    setTitle(children);

    let frame = 0;
    const update = () => {
      frame = 0;
      const title = ref.current;
      const bar = document.querySelector(`[${NAV_BAR_ATTR}]`);
      // No visible bar (desktop): never collapse.
      if (!title || !bar || bar.getBoundingClientRect().height === 0) return setCollapsed(false);
      setCollapsed(title.getBoundingClientRect().bottom <= bar.getBoundingClientRect().bottom);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      setTitle(null);
      setCollapsed(false);
    };
  }, [children, setters]);

  return (
    <h1
      ref={ref}
      className={cn(
        // 34pt large title on phones, the existing heading size from md up
        "font-heading text-[34px] leading-[1.15] font-semibold tracking-tight text-oreo-slate-purple md:text-3xl",
        className
      )}
    >
      {children}
    </h1>
  );
}
