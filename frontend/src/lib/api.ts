/**
 * Base API client for the Django backend.
 * - Attaches JWT Bearer token from localStorage on every authenticated request
 * - Passwords are NEVER stored here — only the short-lived access token and
 *   the refresh token (stored in localStorage for session persistence)
 * - On logout, the refresh token is blacklisted server-side in Neon PostgreSQL
 */

const API_BASE = "/api";

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as
      | { detail?: string; error?: string; non_field_errors?: string[] }
      | null;

    // Django REST Framework returns validation errors in different shapes
    const message =
      body?.detail ||
      body?.error ||
      body?.non_field_errors?.[0] ||
      `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Auth helpers ────────────────────────────────────────────────────────────

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    initials: string;
    role: string;
    avatar_url: string;
  };
}

/**
 * Exchange email + password for JWT tokens.
 * Returns the user profile embedded in the token response — no extra /me/ call needed.
 * The password is sent over HTTPS and is NEVER stored anywhere on the client.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>("/auth/token/", {
    username: email,   // Django SimplJWT uses the "username" field name
    password,
  });
  setTokens(data.access, data.refresh);
  return data;
}

/**
 * Blacklist the refresh token in the database so it cannot be reused,
 * then clear tokens from localStorage.
 */
export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await api.post("/users/logout/", { refresh });
    } catch {
      // Continue logout even if the server call fails
    }
  }
  clearTokens();
}
