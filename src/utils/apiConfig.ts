export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

export const isBackendLoginType = (loginType?: string | null): boolean => {
  if (!loginType) {
    return false;
  }
  const normalized = loginType.toLowerCase();
  return normalized === 'academic' || normalized === 'administrative';
};