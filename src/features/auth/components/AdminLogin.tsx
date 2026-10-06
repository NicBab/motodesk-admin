"use client";

import { useState, type FormEvent } from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  usePlatformSession,
} from "../PlatformSessionProvider";

//************************************************************** */

const inputClasses =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:bg-zinc-50";

//************************************************************** */

export function AdminLogin() {
  const { signIn } = usePlatformSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //************************************************************** */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signIn({
        email,
        password,
      });

      setPassword("");
    } catch (caughtError) {
      setError(
        getApiErrorMessage(
          caughtError,
          "MotoDesk could not complete sign-in. Try again.",
        ),
      );

      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  }

  //************************************************************** */

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-zinc-900 text-orange-400">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
            MotoDesk Administration
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Platform operations and organization oversight
          </p>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            Administrator Sign In
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Use your existing MotoDesk account. An active platform
            administrator grant is required.
          </p>

          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-6 space-y-5"
          >
            <label htmlFor="admin-email" className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">
                Email Address
              </span>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                maxLength={254}
                value={email}
                disabled={isSubmitting}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </label>

            <label htmlFor="admin-password" className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">
                Password
              </span>

              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClasses} pr-12`}
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}

              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
          Access is restricted to authorized MotoDesk platform administrators.
        </p>
      </div>
    </main>
  );
}

//************************************************************** */