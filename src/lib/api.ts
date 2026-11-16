const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API = `${API_BASE_URL}/videos/api`;
export const BACKEND_URL = API_BASE_URL;

// Access token exists only in memory.
let accessToken: string | null = null;

// CSRF token exists only in memory.
let csrfToken: string | null = null;

// Shared requests prevent duplicate refresh and CSRF requests.
let refreshPromise: Promise<string | null> | null = null;
let csrfPromise: Promise<string | null> | null = null;

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

function getCurrentLanguage(): string {
  if (typeof window === "undefined") {
    return "fa";
  }

  return localStorage.getItem("language") === "en" ? "en" : "fa";
}

// Obtain a CSRF token from Django.
async function requestCsrfToken(): Promise<string | null> {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = (async () => {
      try {
        const response = await fetch(`${API}/csrf/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept-Language": getCurrentLanguage(),
          },
        });

        if (!response.ok) {
          console.error("CSRF token request failed:", response.status);
          return null;
        }

        const data: { csrfToken?: string } = await response.json();

        if (!data.csrfToken) {
          console.error("CSRF token is missing from the response.");
          return null;
        }

        csrfToken = data.csrfToken;
        return csrfToken;
      } catch (error) {
        console.error("CSRF token request error:", error);
        return null;
      }
    })().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
}

// Useful for direct fetch requests outside apiFetch.
export async function getCsrfHeaders(): Promise<Record<string, string>> {
  const token = await requestCsrfToken();

  return token ? { "X-CSRFToken": token } : {};
}

function getHeaders(
  options: RequestInit,
  token?: string | null,
  csrf?: string | null
): Headers {
  const headers = new Headers(options.headers);

  headers.set("Accept-Language", getCurrentLanguage());

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  if (csrf) {
    headers.set("X-CSRFToken", csrf);
  }

  return headers;
}

// Refresh the access token using the HttpOnly refresh cookie.
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const csrf = await requestCsrfToken();

        if (!csrf) {
          return null;
        }

        const response = await fetch(`${API}/refresh/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Accept-Language": getCurrentLanguage(),
            "X-CSRFToken": csrf,
          },
        });

        if (!response.ok) {
          clearAccessToken();
          return null;
        }

        const data: { access?: string } = await response.json();

        if (!data.access) {
          clearAccessToken();
          return null;
        }

        setAccessToken(data.access);
        return data.access;
      } catch (error) {
        console.error("Token refresh failed:", error);
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Restore an access token when the application starts.
export async function ensureAccessToken(): Promise<string | null> {
  if (accessToken) {
    return accessToken;
  }

  return refreshAccessToken();
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const tokenUsed = getAccessToken();
  const method = (options.method ?? "GET").toUpperCase();

  // Unsafe methods receive a CSRF header automatically.
  const csrf = SAFE_METHODS.has(method)
    ? null
    : await requestCsrfToken();

  const buildHeaders = (token: string | null) =>
    getHeaders(options, token, csrf);

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(tokenUsed),
    credentials: "include",
  });

  if (
    response.status !== 401 ||
    !retry ||
    url.includes("/login/") ||
    url.includes("/refresh/") ||
    url.includes("/logout/")
  ) {
    return response;
  }

  // Another request may already have refreshed the token.
  const currentToken = getAccessToken();

  if (currentToken && currentToken !== tokenUsed) {
    return fetch(url, {
      ...options,
      headers: buildHeaders(currentToken),
      credentials: "include",
    });
  }

  const newAccessToken = await refreshAccessToken();

  if (!newAccessToken) {
    return response;
  }

  return fetch(url, {
    ...options,
    headers: buildHeaders(newAccessToken),
    credentials: "include",
  });
}