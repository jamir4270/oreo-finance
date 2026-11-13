import { ViewTransition } from "react";

/*
 * iOS navigation push for drill-in links (UINavigationController): links tagged
 * transitionTypes={["nav-forward"]} slide the new page in from the right while the old
 * one parallaxes left. Untyped navigations (tab switches, back button, refresh) stay
 * instant, as UITabBarController does. CSS lives in globals.css (.nav-forward/.nav-back).
 * Must wrap each page.tsx and loading.tsx: layouts persist, so enter/exit never fire there.
 */
const DIRECTIONS = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONS} exit={DIRECTIONS} default="none">
      {children}
    </ViewTransition>
  );
}
