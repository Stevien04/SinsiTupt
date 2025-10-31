import type { Usuario } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

class UsuariosService {
  async getDocentes(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/docentes`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching docentes:', error);
      throw error;
    }
  }
}

export const usuariosService = new UsuariosService();