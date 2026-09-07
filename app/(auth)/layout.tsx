import { AuthSidebar } from "@/components/auth/AuthSidebar";

/**
 * Auth pages layout — standalone, no app nav shell.
 *
 * Asymmetric split layout:
 *  - Left/Top: Oreo mascot + dynamic tips panel
 *  - Right/Bottom: Card container for the form
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Mobile Top Panel */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2 lg:hidden">
        <AuthSidebar />
      </div>

      {/* Form Area */}
      <div className="flex flex-1 items-center justify-center p-4 pt-4 pb-12 lg:py-12 lg:p-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Desktop Right Panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-oreo-lavender/30 p-12 lg:w-1/2 border-l border-oreo-lavender/50">
        <AuthSidebar />
      </div>
    </div>
  );
}
