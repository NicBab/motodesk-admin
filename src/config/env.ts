//************************************************************** */

function readApiUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim();

  const value =
    configuredUrl || "http://localhost:5001/api/v1";

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be a valid absolute URL.",
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must use HTTP or HTTPS.",
    );
  }

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL cannot contain credentials, a query, or a fragment.",
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must use HTTPS in production.",
    );
  }

  return url.toString().replace(/\/+$/, "");
}

//************************************************************** */

export const adminEnv = {
  apiUrl: readApiUrl(),
};

//************************************************************** */