import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import {
  API,
  getAccessToken,
  getApiLanguage,
  refreshAccessToken,
} from "@/lib/api";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosClient = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});



// Attach the shared in-memory access token to every request.
axiosClient.interceptors.request.use((config) => {
  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    config.headers.delete("Content-Type");
  }
  config.headers.set("Accept-Language", getApiLanguage());

  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

// Use the shared refresh mechanism when a request receives 401.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    const requestUrl = originalRequest?.url ?? "";

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes("/login/") ||
      requestUrl.includes("/refresh/") ||
      requestUrl.includes("/logout/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const authorization = originalRequest.headers.get("Authorization");

    const tokenUsed =
      typeof authorization === "string" &&
      authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    // Reuse a token refreshed by another request when available.
    const currentToken = getAccessToken();

    const accessToken =
      currentToken && currentToken !== tokenUsed
        ? currentToken
        : await refreshAccessToken();

    if (!accessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );

    return axiosClient(originalRequest);
  }
);