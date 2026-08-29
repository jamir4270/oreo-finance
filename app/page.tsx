import Image from "next/image";

/**
 * Phase 1 — Branded placeholder page
 *
 * Validates the design system is working:
 *  - Oreo mascot SVG rendered crisp (pixel-art, fixed-pixel sizing)
 *  - Fredoka heading, Inter body text, JetBrains Mono monetary figures
 *  - Full palette swatches
 *  - Soft shadows, generous corner radii, breathing room
 */

const PALETTE_SWATCHES = [
  { name: "Lavender", hex: "#d8dcff", token: "oreo-lavender", textDark: false },
  { name: "Periwinkle", hex: "#aeadf0", token: "oreo-periwinkle", textDark: false },
  { name: "Dusty Rose", hex: "#c38d94", token: "oreo-dusty-rose", textDark: false },
  { name: "Mauve", hex: "#a76571", token: "oreo-mauve", textDark: true },
  { name: "Slate Purple", hex: "#565676", token: "oreo-slate-purple", textDark: true },
  { name: "Dusty Teal", hex: "#5f8f8a", token: "oreo-dusty-teal", textDark: true },
  { name: "Teal Light", hex: "#93bcb7", token: "oreo-dusty-teal-light", textDark: false },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:py-24">
      <main className="flex w-full max-w-2xl flex-col items-center gap-10">
        {/* === Mascot + Logo === */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative flex items-center justify-center rounded-3xl bg-card p-6"
            style={{
              boxShadow:
                "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
            }}
          >
            <Image
              src="/oreo.svg"
              alt="Oreo — pixel-art black cat mascot"
              width={128}
              height={128}
              className="h-32 w-32"
              style={{ imageRendering: "pixelated" }}
              priority
            />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-heading text-5xl font-semibold tracking-tight text-oreo-slate-purple md:text-6xl">
              Oreo
            </h1>
            <p className="max-w-sm text-lg text-muted-foreground">
              Your cozy personal finance companion — track spending, plan
              budgets, and reach your goals.
            </p>
          </div>
        </div>

        {/* === Typography Demo === */}
        <div
          className="w-full rounded-2xl bg-card p-8"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <h2 className="font-heading mb-4 text-xl font-medium text-oreo-slate-purple">
            Typography
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-heading text-2xl font-semibold text-oreo-slate-purple">
                Fredoka
              </span>
              <span className="text-sm text-muted-foreground">
                Display · headings
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-lg text-foreground">
                Inter — body and UI text
              </span>
              <span className="text-sm text-muted-foreground">
                Body · labels
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-2xl tabular-nums text-oreo-dusty-teal">
                $12,345.67
              </span>
              <span className="text-sm text-muted-foreground">
                JetBrains Mono · monetary
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="font-mono text-lg tabular-nums text-oreo-mauve">
                −$2,480.00
              </span>
              <span className="text-xs text-muted-foreground">expense</span>
              <span className="mx-1 text-muted-foreground">·</span>
              <span className="font-mono text-lg tabular-nums text-oreo-dusty-teal">
                +$5,200.00
              </span>
              <span className="text-xs text-muted-foreground">income</span>
            </div>
          </div>
        </div>

        {/* === Color Palette === */}
        <div
          className="w-full rounded-2xl bg-card p-8"
          style={{
            boxShadow:
              "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
          }}
        >
          <h2 className="font-heading mb-4 text-xl font-medium text-oreo-slate-purple">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {PALETTE_SWATCHES.map((swatch) => (
              <div key={swatch.token} className="flex flex-col gap-1.5">
                <div
                  className="h-16 rounded-xl"
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="flex flex-col px-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {swatch.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {swatch.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === Status badge === */}
        <div className="flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm text-muted-foreground"
          style={{
            boxShadow:
              "0 2px 12px rgba(86, 86, 118, 0.06), 0 1px 3px rgba(86, 86, 118, 0.03)",
          }}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-oreo-dusty-teal" />
          Phase 1 scaffold — design system configured
        </div>
      </main>
    </div>
  );
}
