"use client";

import type { ReactNode } from "react";

import { Toaster } from "sonner";

import {
  PlatformSessionProvider,
} from "@/features/auth/PlatformSessionProvider";

import {
  PlatformSessionGate,
} from "@/features/auth/components/PlatformSessionGate";

//************************************************************** */

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PlatformSessionProvider>
      <PlatformSessionGate>
        {children}
      </PlatformSessionGate>

      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </PlatformSessionProvider>
  );
}

//************************************************************** */