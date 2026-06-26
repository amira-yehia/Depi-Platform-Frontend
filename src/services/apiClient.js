// Re-export everything from the new central api.js for backward compatibility
export { apiFetch, getToken, saveTokens, clearTokens, authService } from "./api";

// getCurrentUser — used by older components
export { apiFetch as apiRequest } from "./api";

export async function getCurrentUser() {
  const { authService } = await import("./api");
  return authService.me();
}

export async function logout() {
  const { authService } = await import("./api");
  return authService.logout();
}

export function refreshAccessToken() {
  // handled automatically inside apiFetch
  return Promise.resolve(null);
}

export default { getCurrentUser, logout, refreshAccessToken };
