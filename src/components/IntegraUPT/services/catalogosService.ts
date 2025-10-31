const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

export interface CatalogoItem {
  id: number;
  nombre: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `Error al consultar ${url} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function obtenerFacultades(): Promise<CatalogoItem[]> {
  return fetchJson<CatalogoItem[]>(`${API_BASE_URL}/api/catalogos/facultades`);
}

export async function obtenerEscuelas(facultadId?: number): Promise<CatalogoItem[]> {
  const url = facultadId != null
    ? `${API_BASE_URL}/api/catalogos/escuelas?facultadId=${encodeURIComponent(facultadId)}`
    : `${API_BASE_URL}/api/catalogos/escuelas`;
  return fetchJson<CatalogoItem[]>(url);
}
