"use client";

import { useState, type ReactNode } from "react";

import Link from "next/link";

import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ScrollText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  usePlatformSession,
} from "@/features/auth/PlatformSessionProvider";

import {
  getApiErrorMessage,
} from "@/lib/api/api-error";

//************************************************************** */

export type AdminSection =
  | "overview"
  | "organizations"
  | "users"
  | "billing"
  | "audit";

const navigation = [
  {
    id: "overview",
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    id: "organizations",
    label: "Organizations",
    href: "/organizations",
    icon: Building2,
  },
  {
    id: "users",
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    id: "billing",
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    id: "audit",
    label: "Audit Logs",
    href: "/audit",
    icon: ScrollText,
  },
] as const;

//************************************************************** */

export function AdminShell({
  activeSection,
  title,
  description,
  children,
}: {
  activeSection: AdminSection;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { session, signOut } = usePlatformSession();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "MotoDesk could not complete sign-out.",
        ),
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  const displayName = session
    ? [
        session.user.firstName,
        session.user.lastName,
      ].filter(Boolean).join(" ")
    : "Administrator";

  //************************************************************** */

  return (
    <div className="min-h-screen bg-zinc-100">
      <Link
        href="#admin-main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm text-zinc-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </Link>

      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-navigation"
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-zinc-950 text-white transition-transform lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                MotoDesk
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Platform Administration
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          aria-label="Platform navigation"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
        >
          {navigation.map((item) => {
            const selected = activeSection === item.id;
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition",
                  selected
                    ? "bg-orange-500/15 text-orange-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">
            {displayName}
          </p>

          <p className="mt-1 truncate text-xs text-zinc-500">
            {session?.user.email}
          </p>

          <span className="mt-3 inline-block rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            {session?.platformAdmin.role === "SUPER_ADMIN"
              ? "Super Administrator"
              : "Platform Administrator"}
          </span>

          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-xs font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {isSigningOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            {isSigningOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex min-h-20 items-center gap-4 border-b border-zinc-200 bg-white px-4 py-4 sm:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              {title}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {description}
            </p>
          </div>
        </header>

        <main
          id="admin-main"
          tabIndex={-1}
          className="mx-auto max-w-[1600px] space-y-6 p-4 outline-none sm:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

//************************************************************** */