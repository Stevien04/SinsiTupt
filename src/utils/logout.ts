import { API_BASE_URL } from './apiConfig';

const parseUserId = (userId: string | number | null | undefined): number | null => {
  if (typeof userId === 'number' && Number.isFinite(userId)) {
    return userId;
  }

  if (typeof userId === 'string') {
    const trimmed = userId.trim();
    if (/^\d+$/.test(trimmed)) {
      const parsed = Number.parseInt(trimmed, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
  }

  return null;
};

const buildPayload = (userId: number) => JSON.stringify({ usuarioId: userId });

const getLogoutUrl = () => `${API_BASE_URL}/api/auth/logout`;

export const requestBackendLogout = async (userId: string | number | null | undefined): Promise<void> => {
  const numericId = parseUserId(userId);
  if (numericId === null) {
    return;
  }

  try {
    await fetch(getLogoutUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: buildPayload(numericId)
    });
  } catch (error) {
    console.error('No se pudo cerrar la sesión en el backend:', error);
  }
};

export const sendLogoutBeacon = (userId: string | number | null | undefined): void => {
  const numericId = parseUserId(userId);
  if (numericId === null) {
    return;
  }

  const payload = buildPayload(numericId);
  const url = getLogoutUrl();

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    const sent = navigator.sendBeacon(url, blob);
    if (sent) {
      return;
    }
  }

  if (typeof fetch === 'function') {
    try {
      void fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload,
        keepalive: true
      });
    } catch (error) {
      console.error('No se pudo enviar el cierre de sesión durante la navegación:', error);
    }
  }
};