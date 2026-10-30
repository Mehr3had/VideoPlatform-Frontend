import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API_URL = `${API_BASE_URL}/videos/api`;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  access?: string;
}

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

function getCurrentLanguage(): string {
  if (typeof window === "undefined") {
    return "fa";
  }

  return localStorage.getItem("language") === "en" ? "en" : "fa";
}

function getRefreshedAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await axios.post<RefreshResponse>(
          `${API_URL}/refresh/`,
          {},
          {
            withCredentials: true,
            headers: {
              "Accept-Language": getCurrentLanguage(),
            },
          }
        );

        const accessToken = response.data.access;

        if (!accessToken) {
          localStorage.removeItem("accessToken");
          return null;
        }

        localStorage.setItem("accessToken", accessToken);

        return accessToken;
      } catch {
        localStorage.removeItem("accessToken");
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

axiosClient.interceptors.request.use((config) => {
  config.headers.set("Accept-Language", getCurrentLanguage());

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/login/") ||
      originalRequest.url?.includes("/refresh/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const accessToken = await getRefreshedAccessToken();

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