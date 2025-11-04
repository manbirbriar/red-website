const FALLBACK_API_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? FALLBACK_API_BASE_URL);

export const AVAILABILITY_ENDPOINT = `${API_BASE_URL}/availability`;
export const BOOKINGS_ENDPOINT = `${API_BASE_URL}/bookings`;
export const ADMIN_ENDPOINT = `${API_BASE_URL}/admin`;
