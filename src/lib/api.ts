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

type ApiUploadCallbacks = {
    onProgress?: (percent: number) => void;
    onUploadComplete?: () => void;
};

export async function apiUpload(
    url: string,
    options: RequestInit = {},
    callbacks: ApiUploadCallbacks = {},
    retry = true,
): Promise<Response> {
    const tokenUsed = getAccessToken();
    const method = (options.method ?? "GET").toUpperCase();
    const csrf = SAFE_METHODS.has(method) ? null : await requestCsrfToken();

    const buildHeaders = (token: string | null) => getHeaders(options, token, csrf);

    const sendRequest = (token: string | null): Promise<Response> =>
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            callbacks.onProgress?.(0);

            xhr.open(method, url, true);
            xhr.withCredentials = true;

            buildHeaders(token).forEach((value, key) => {
                xhr.setRequestHeader(key, value);
            });

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && event.total > 0) {
                    const percent = Math.min(
                        100,
                        Math.round((event.loaded / event.total) * 100),
                    );
                    callbacks.onProgress?.(percent);
                }
            };

            xhr.upload.onload = () => {
                callbacks.onProgress?.(100);
                callbacks.onUploadComplete?.();
            };

            xhr.onload = () => {
                if (xhr.status === 0) {
                    reject(new Error("Upload request failed."));
                    return;
                }

                try {
                    const responseHeaders = new Headers();
                    const rawHeaders = xhr.getAllResponseHeaders();

                    rawHeaders.split(/\r?\n/).forEach((line) => {
                        const separatorIndex = line.indexOf(":");

                        if (separatorIndex > 0) {
                            responseHeaders.append(
                                line.slice(0, separatorIndex).trim(),
                                line.slice(separatorIndex + 1).trim(),
                            );
                        }
                    });

                    const responseBody = [204, 205, 304].includes(xhr.status)
                        ? null
                        : xhr.responseText;

                    resolve(
                        new Response(responseBody, {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            headers: responseHeaders,
                        }),
                    );
                } catch (error) {
                    reject(error);
                }
            };

            xhr.onerror = () => reject(new Error("Network request failed."));
            xhr.onabort = () => reject(new Error("Upload request was aborted."));

            if (options.body === null || options.body === undefined) {
                xhr.send();
            } else {
                xhr.send(options.body as XMLHttpRequestBodyInit);
            }
        });

    const response = await sendRequest(tokenUsed);

    if (
        response.status !== 401 ||
        !retry ||
        url.includes("/login/") ||
        url.includes("/refresh/") ||
        url.includes("/logout/")
    ) {
        return response;
    }

    const currentToken = getAccessToken();

    if (currentToken && currentToken !== tokenUsed) {
        return sendRequest(currentToken);
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
        return response;
    }

    return sendRequest(newAccessToken);
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