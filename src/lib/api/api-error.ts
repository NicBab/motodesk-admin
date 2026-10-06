//************************************************************** */

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiMessageResponse = {
  success: true;
  message: string;
};

export type ApiErrorPayload = {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
};

//************************************************************** */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(
    status: number,
    payload: ApiErrorPayload,
  ) {
    super(payload.message);

    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

//************************************************************** */

export function isApiErrorPayload(
  value: unknown,
): value is ApiErrorPayload {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    payload.success === false &&
    typeof payload.message === "string" &&
    (
      payload.code === undefined ||
      typeof payload.code === "string"
    )
  );
}

//************************************************************** */

export function getApiErrorMessage(
  error: unknown,
  fallback = "MotoDesk could not complete that request.",
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

//************************************************************** */