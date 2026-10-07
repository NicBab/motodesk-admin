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
    "/platform/auth/login",
    {
      method: "POST",

      body: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
      },

      refreshOnUnauthorized: false,
    },
  );

  return getPlatformSession();
}

//************************************************************** */

export async function logoutPlatformAdmin(): Promise<void> {
  try {
    await apiRequestVoid(
      "/platform/auth/logout",
      {
        method: "POST",
        body: {},
        refreshOnUnauthorized: false,
      },
    );
  } catch (error) {
    // The server clears admin cookies even when the logout
    // credential is missing or invalid.
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