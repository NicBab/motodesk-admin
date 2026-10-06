"use client";

import { useState, type ReactNode } from "react";

import {
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  usePlatformSession,
} from "../PlatformSessionProvider";

import { AdminLogin } from "./AdminLogin";

//************************************************************** */

export function PlatformSessionGate({
  children,
}: {
  children: ReactNode;
}) {
  const {
    status,
    session,
    message,
    reloadSession,
    signOut,
  } = usePlatformSession();

  const [isRetrying, setIsRetrying] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [actionError, setActionError] =
    useState<string | null>(null);

  //************************************************************** */

  async function handleRetry(): Promise<void> {
    if (isRetrying || isSigningOut) {
      return;
    }

    setActionError(null);
    setIsRetrying(true);

    try {
      await reloadSession();
    } finally {
      setIsRetrying(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    if (isRetrying || isSigningOut) {
      return;
    }

    setActionError(null);
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          "Sign-out could not be completed. Try again.",
        ),
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  //************************************************************** */

  if (status === "loading") {
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center gap-3 bg-zinc-100 px-4 text-sm text-zinc-500"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        Verifying platform access…
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <AdminLogin />;
  }

  if (status === "authenticated" && session) {
    return <>{children}</>;
  }

  const forbidden = status === "forbidden";
  const busy = isRetrying || isSigningOut;

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert
          className={[
            "mx-auto h-10 w-10",
            forbidden ? "text-amber-500" : "text-zinc-400",
          ].join(" ")}
        />

        <h1 className="mt-4 text-xl font-semibold text-zinc-900">
          {forbidden
            ? "Platform Access Unavailable"
            : "Unable to Verify Access"}
        </h1>

        <p role="alert" className="mt-3 text-sm leading-6 text-zinc-500">
          {message ??
            "MotoDesk could not verify an authorized platform session."}
        </p>

        {forbidden ? (
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            An active platform administrator grant and a verified account
            email are required. Organization roles do not provide platform access.
          </p>
        ) : null}

        {actionError ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {actionError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleRetry()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            {isRetrying ? "Checking…" : "Try Again"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSignOut()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            {isSigningOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </section>
    </main>
  );
}

//************************************************************** */