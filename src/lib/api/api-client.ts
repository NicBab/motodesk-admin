"use client";

import { adminEnv } from "@/config/env";

import {
  ApiError,
  isApiErrorPayload,
} from "./api-error";

//************************************************************** */

type ApiRequestOptions = Omit<
  RequestInit,
  "body" | "credentials" | "cache"
> & {
  body?: unknown;
  refreshOnUnauthorized?: boolean;
};

//************************************************************** */

let refreshInFlight: Promise<void> | null = null;
let refreshGeneration = 0;

//************************************************************** */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

//************************************************************** */

async function parseResponse(
  response: Response,
): Promise<unknown> {
  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      isApiErrorPayload(payload)
        ? payload
        : {
            success: false,
            message: "MotoDesk could not complete that request.",
          },
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  if (!isRecord(payload) || payload.success !== true) {
    throw new ApiError(response.status, {
      success: false,
      message: "MotoDesk received an unexpected server response.",
      code: "UNEXPECTED_API_RESPONSE",
    });
  }

  return payload;
}

//************************************************************** */

async function performRefresh(): Promise<void> {
  const response = await fetch(
    `${adminEnv.apiUrl}/platform/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  await parseResponse(response);
}

//************************************************************** */

async function refreshSession(): Promise<void> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const operation = async () => {
    if (
      typeof navigator !== "undefined" &&
      "locks" in navigator
    ) {
      await navigator.locks.request(
        "motodesk-admin-session-refresh",
        async () => {
          // Another admin tab may have refreshed while this tab
          // waited for the lock. Check before rotating again.
          const probe = await fetch(
            `${adminEnv.apiUrl}/platform/me`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (probe.status === 401) {
            await performRefresh();
            return;
          }

          // A 403 means the session reached authorization.
          // Refreshing cannot grant platform permission.
          if (!probe.ok && probe.status !== 403) {
            await parseResponse(probe);
          }
        },
      );
    } else {
      await performRefresh();
    }

    refreshGeneration += 1;
  };

  refreshInFlight = operation();

  try {
    await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

//************************************************************** */

async function sendRequest(
  path: string,
  options: ApiRequestOptions,
): Promise<Response> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API paths must start with a single slash.");
  }

  const {
    body,
    refreshOnUnauthorized: _refreshOnUnauthorized,
    ...requestOptions
  } = options;

  // This option is consumed by requestWithRefresh, not fetch.
  void _refreshOnUnauthorized;

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${adminEnv.apiUrl}${path}`, {
    ...requestOptions,
    headers,
    credentials: "include",
    cache: "no-store",

    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });
}

//************************************************************** */

async function requestWithRefresh(
  path: string,
  options: ApiRequestOptions,
): Promise<unknown> {
  const generationAtStart = refreshGeneration;
  const method = (options.method ?? "GET").toUpperCase();

  const response = await sendRequest(path, options);

  // Automatically retry only reads. Login/logout and other
  // mutations are never replayed by this request layer.
  const canRefresh =
    options.refreshOnUnauthorized !== false &&
    method === "GET" &&
    path.startsWith("/platform/");

  if (response.status !== 401 || !canRefresh) {
    return parseResponse(response);
  }

  if (refreshInFlight) {
    await refreshInFlight;
  } else if (generationAtStart === refreshGeneration) {
    await refreshSession();
  }

  // Retry at most once. A second failure reaches the caller.
  const retriedResponse = await sendRequest(path, options);

  return parseResponse(retriedResponse);
}

//************************************************************** */

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const payload = await requestWithRefresh(path, options);

  if (
    !isRecord(payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new ApiError(200, {
      success: false,
      message: "MotoDesk received an unexpected data response.",
      code: "UNEXPECTED_API_RESPONSE",
    });
  }

  return payload.data as T;
}

//************************************************************** */

export async function apiRequestVoid(
  path: string,
  options: ApiRequestOptions = {},
): Promise<void> {
  const payload = await requestWithRefresh(path, options);

  if (payload === undefined) {
    return;
  }

  if (
    isRecord(payload) &&
    payload.success === true &&
    (
      typeof payload.message === "string" ||
      "data" in payload
    )
  ) {
    return;
  }

  throw new ApiError(200, {
    success: false,
    message: "MotoDesk received an unexpected server response.",
    code: "UNEXPECTED_API_RESPONSE",
  });
}

//************************************************************** */