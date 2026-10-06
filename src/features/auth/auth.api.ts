"use client";

import {
  apiRequest,
  apiRequestVoid,
} from "@/lib/api/api-client";

import { ApiError } from "@/lib/api/api-error";

import type {
  LoginInput,
  LoginResponse,
  PlatformSession,
} from "./auth.types";

//************************************************************** */

export async function getPlatformSession(
  signal?: AbortSignal,
): Promise<PlatformSession> {
  return apiRequest<PlatformSession>(
    "/platform/me",
    {
      method: "GET",

      ...(signal !== undefined
        ? { signal }
        : {}),
    },
  );
}

//************************************************************** */

export async function loginPlatformAdmin(
  input: LoginInput,
): Promise<PlatformSession> {
  await apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",

      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },

      refreshOnUnauthorized: false,
    },
  );

  // Successful authentication alone does not grant platform access.
  return getPlatformSession();
}

//************************************************************** */

export async function logoutPlatformAdmin(): Promise<void> {
  try {
    await apiRequestVoid(
      "/auth/logout",
      {
        method: "POST",
        body: {},
        refreshOnUnauthorized: false,
      },
    );
  } catch (error) {
    // The server clears authentication cookies when no refresh
    // credential exists. Treat that response as already signed out.
    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      return;
    }

    throw error;
  }
}

//************************************************************** */