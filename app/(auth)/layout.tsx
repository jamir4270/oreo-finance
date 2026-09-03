import Image from "next/image";

/**
 * Auth pages layout — standalone, no app nav shell.
 *
 * Centered layout with:
 *  - Oreo mascot + brand name
 *  - Card container for the form
 *  - Lavender background consistent with design spec §2
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {/* Mascot + Brand */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl bg-card p-4"
            style={{
              boxShadow:
                "0 4px 24px rgba(86, 86, 118, 0.08), 0 1px 4px rgba(86, 86, 118, 0.04)",
            }}
          >
            <Image
              src="/oreo.svg"
              alt="Oreo — pixel-art black cat mascot"
              width={72}
              height={72}
              className="h-[72px] w-[72px]"
              style={{ imageRendering: "pixelated" }}
              priority
            />
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-oreo-slate-purple">
            Oreo
          </h1>
        </div>

        {/* Page content (login/signup/reset form) */}
        {children}
      </div>
    </div>
  );
}
