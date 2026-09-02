import React from "react";
import { BottomNavigation } from "./BottomNavigation";

export function MobileAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-blush)] to-[var(--color-bg)] md:flex md:items-center md:justify-center md:py-10">
      <div className="paper-grain relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--color-bg)] md:min-h-[880px] md:rounded-[36px] md:shadow-2xl md:shadow-[var(--color-rose)]/15 md:ring-1 md:ring-[var(--color-line)]">
        <div className="no-scrollbar flex-1 overflow-y-auto pb-28">{children}</div>
        <BottomNavigation />
      </div>
    </div>
  );
}
