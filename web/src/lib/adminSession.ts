const ADMIN_TOKEN_KEY = "red-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return token
    ? {
        "X-Admin-Token": token,
      }
    : {};
}
