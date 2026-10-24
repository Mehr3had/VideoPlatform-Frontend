const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API = `${API_BASE_URL}/videos/api`;
export const BACKEND_URL = API_BASE_URL;

let refreshPromise: Promise<string | null> | null = null;

function getCurrentLanguage(): string {
  const language = localStorage.getItem("language");
  return language === "en" ? "en" : "fa";
}

function getHeaders(options: RequestInit, token?: string): Headers {
  const headers = new Headers(options.headers);

  headers.set("Accept-Language", getCurrentLanguage());

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

function getRefreshedAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API}/refresh/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Accept-Language": getCurrentLanguage(),
          },
        });

        if (!response.ok) {
          localStorage.removeItem("accessToken");
          return null;
        }

        const data = await response.json();

        if (!data.access) {
          localStorage.removeItem("accessToken");
          return null;
        }

        localStorage.setItem("accessToken", data.access);
        return data.access;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options, token ?? undefined),
    credentials: "include",
  });

  if (
    response.status !== 401 ||
    !retry ||
    url.includes("/login/") ||
    url.includes("/refresh/")
  ) {
    return response;
  }

  const newAccessToken = await getRefreshedAccessToken();

  if (!newAccessToken) {
    return response;
  }

  return fetch(url, {
    ...options,
    headers: getHeaders(options, newAccessToken),
    credentials: "include",
  });
}