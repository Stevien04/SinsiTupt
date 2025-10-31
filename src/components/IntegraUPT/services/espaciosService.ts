import type { Espacio } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

const normalizeString = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

export interface EspacioFormData {
  codigo: string;
  nombre: string;
  ubicacion: string;
  tipo: 'Laboratorio' | 'Salon';
  capacidad: number;
  equipamiento: string;
  facultadId: number;
  escuelaId: number;
  estado: number;
}

// Mapeo de facultades (ID -> Nombre)
const FACULTADES_MAP: { [key: number]: string } = {
  1: 'FAING',
  2: 'FADE',
  3: 'FACEM', 
  4: 'FAEDCOH',
  5: 'FACSA',
  6: 'FAU'
};

// Mapeo de escuelas (ID -> Nombre)
const ESCUELAS_MAP: { [key: number]: string } = {
  1: 'Ing. Civil',
  2: 'Ing. de Sistemas',
  3: 'Ing. Electronica',
  4: 'Ing. Agroindustrial',
  5: 'Ing. Ambiental',
  6: 'Ing. Industrial',
  7: 'Derecho',
  8: 'Ciencias Contables y Financieras',
  9: 'Economia y Microfinanzas',
  10: 'Administracion',
  11: 'Administracion Turistico-Hotel',
  12: 'Administracion de Negocios Internacionales',
  13: 'Educacion',
  14: 'Ciencias de la Comunicacion',
  15: 'Humanidades - Psicologia',
  16: 'Medicina Humana',
  17: 'Odontologia',
  18: 'Tecnologia Medica',
  19: 'Arquitectura'
};

class EspaciosService {
  async getAllEspacios(params?: { escuelaId?: number | null }): Promise<Espacio[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/espacios`);
            if (params?.escuelaId != null) {
              url.searchParams.set('escuelaId', String(params.escuelaId));
            }

            const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const espacios: Espacio[] = await response.json();
      return espacios;
    } catch (error) {
      console.error('Error fetching espacios:', error);
      throw error;
    }
  }

  async getEspacioById(id: string): Promise<Espacio | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/espacios/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.espacio;
    } catch (error) {
      console.error('Error fetching espacio:', error);
      return null;
    }
  }

  async createEspacio(espacioData: EspacioFormData): Promise<Espacio> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/espacios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(espacioData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al crear el espacio');
      }

      return result.espacio;
    } catch (error) {
      console.error('Error creating espacio:', error);
      throw error;
    }
  }

  async updateEspacio(id: string, espacioData: EspacioFormData): Promise<Espacio> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/espacios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(espacioData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al actualizar el espacio');
      }

      return result.espacio;
    } catch (error) {
      console.error('Error updating espacio:', error);
      throw error;
    }
  }

  async deleteEspacio(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/espacios/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al eliminar el espacio');
      }
    } catch (error) {
      console.error('Error deleting espacio:', error);
      throw error;
    }
  }

  async getEspaciosDisponibles(params?: { escuelaId?: number | null }): Promise<Espacio[]> {
    try {
      const url = new URL(`${API_BASE_URL}/api/espacios/disponibles`);
            if (params?.escuelaId != null) {
              url.searchParams.set('escuelaId', String(params.escuelaId));
            }

            const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const espacios: Espacio[] = await response.json();
      return espacios;
    } catch (error) {
      console.error('Error fetching espacios disponibles:', error);
      throw error;
    }
  }

  // Métodos auxiliares para mapeos
  getFacultades() {
    return FACULTADES_MAP;
  }

  getEscuelas() {
    return ESCUELAS_MAP;
  }

  getFacultadNameById(id: number): string {
    return FACULTADES_MAP[id] || `Facultad ${id}`;
  }

  getEscuelaNameById(id: number): string {
    return ESCUELAS_MAP[id] || `Escuela ${id}`;
  }
getEscuelaIdByName(nombre: string | null | undefined): number | null {
    if (!nombre) {
      return null;
    }

    const normalizedNombre = normalizeString(nombre);
    for (const [id, nombreEscuela] of Object.entries(ESCUELAS_MAP)) {
      if (normalizeString(nombreEscuela) === normalizedNombre) {
        return Number(id);
      }
    }

    return null;
  }

  // Método para mapear estado numérico a texto
  getEstadoTexto(estado: number | string): string {
    const estadoNum = typeof estado === 'string' ? parseInt(estado) : estado;
    return estadoNum === 1 ? 'Disponible' : 'En Mantenimiento';
  }

  // Método para mapear tipo de base de datos a tipo del frontend
  getTipoFrontend(tipoBD: string): 'Laboratorio' | 'Aula' {
    return tipoBD === 'Laboratorio' ? 'Laboratorio' : 'Aula';
  }

}

export const espaciosService = new EspaciosService();