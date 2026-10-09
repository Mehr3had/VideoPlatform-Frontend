const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const API = `${API_BASE_URL}/videos/api`;
export const BACKEND_URL = API_BASE_URL;