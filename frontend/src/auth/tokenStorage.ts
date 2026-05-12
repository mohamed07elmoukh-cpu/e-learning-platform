const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const LEGACY_ACCESS_KEY = "el_access_token";
const LEGACY_REFRESH_KEY = "el_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_KEY, token);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  setRefreshToken(token: string) {
    localStorage.setItem(REFRESH_KEY, token);
  },
  clear() {
    // Backward-compat cleanup: remove legacy el_* keys.
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(LEGACY_ACCESS_KEY);
    localStorage.removeItem(LEGACY_REFRESH_KEY);
  }
};
