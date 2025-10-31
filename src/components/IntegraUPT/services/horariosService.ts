import type { Horario, CursoHorario } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

export interface HorarioFormData {
  espacioId: number;
  bloqueId: number;
  diaSemana: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';
  ocupado: boolean;
}

export interface CursoHorarioFormData {
  curso: string;
  docenteId: number;
  espacioId: number;
  bloqueId: number;
  diaSemana: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

export interface BloqueHorarioCatalogo {
  nombre: string;
  horaInicio: string;
  horaFinal: string;
  orden?: number;
}

export type BloqueHorarioCatalogoMap = Record<number, BloqueHorarioCatalogo>;

const DEFAULT_BLOQUES_HORARIOS: BloqueHorarioCatalogoMap = {
  10: { nombre: 'B1', horaInicio: '08:00', horaFinal: '08:50', orden: 1 },
  11: { nombre: 'B2', horaInicio: '08:50', horaFinal: '09:40', orden: 2 },
  13: { nombre: 'B3', horaInicio: '09:40', horaFinal: '10:30', orden: 3 }
};

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

class HorariosService {
     private bloquesHorariosCache: BloqueHorarioCatalogoMap = { ...DEFAULT_BLOQUES_HORARIOS };
  async getAllHorarios(): Promise<Horario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios:', error);
      throw error;
    }
  }

  async getHorarioById(id: string): Promise<Horario | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result.horario;
    } catch (error) {
      console.error('Error fetching horario:', error);
      return null;
    }
  }

  async createHorario(horarioData: HorarioFormData): Promise<Horario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarioData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al crear el horario');
      return result.horario;
    } catch (error) {
      console.error('Error creating horario:', error);
      throw error;
    }
  }

  async updateHorario(id: string, horarioData: HorarioFormData): Promise<Horario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarioData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al actualizar el horario');
      return result.horario;
    } catch (error) {
      console.error('Error updating horario:', error);
      throw error;
    }
  }

  async deleteHorario(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al eliminar el horario');
    } catch (error) {
      console.error('Error deleting horario:', error);
      throw error;
    }
  }

  async getHorariosPorEspacio(espacioId: number): Promise<Horario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/espacio/${espacioId}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios por espacio:', error);
      throw error;
    }
  }

  async getHorariosPorDia(diaSemana: string): Promise<Horario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/dia/${diaSemana}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios por día:', error);
      throw error;
    }
  }

  async getHorariosDisponibles(): Promise<Horario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/disponibles`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios disponibles:', error);
      throw error;
    }
  }

  async getHorariosOcupados(): Promise<Horario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/ocupados`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios ocupados:', error);
      throw error;
    }
  }

  async actualizarOcupacion(id: string, ocupado: boolean): Promise<Horario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/${id}/ocupacion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocupado }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al actualizar la ocupación');
      return result.horario;
    } catch (error) {
      console.error('Error updating ocupacion:', error);
      throw error;
    }
  }

  async getAllCursosHorarios(): Promise<CursoHorario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching cursos horarios:', error);
      throw error;
    }
  }

  async getCursoHorarioById(id: string): Promise<CursoHorario | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      return result.cursoHorario;
    } catch (error) {
      console.error('Error fetching curso horario:', error);
      return null;
    }
  }

  async createCursoHorario(cursoHorarioData: CursoHorarioFormData): Promise<CursoHorario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoHorarioData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al crear el horario de curso');
      return result.cursoHorario;
    } catch (error) {
      console.error('Error creating curso horario:', error);
      throw error;
    }
  }

  async updateCursoHorario(id: string, cursoHorarioData: CursoHorarioFormData): Promise<CursoHorario> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursoHorarioData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al actualizar el horario de curso');
      return result.cursoHorario;
    } catch (error) {
      console.error('Error updating curso horario:', error);
      throw error;
    }
  }

  async deleteCursoHorario(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Error al eliminar el horario de curso');
    } catch (error) {
      console.error('Error deleting curso horario:', error);
      throw error;
    }
  }

  async searchCursosHorarios(curso: string): Promise<CursoHorario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos/buscar?curso=${encodeURIComponent(curso)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching cursos horarios:', error);
      throw error;
    }
  }

  getBloquesHorarios(): BloqueHorarioCatalogoMap {
      return { ...this.bloquesHorariosCache };
    }

    async fetchBloquesHorarios(): Promise<BloqueHorarioCatalogoMap> {
      const response = await fetch(`${API_BASE_URL}/api/bloques-horarios`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const bloques: Array<{
        id: number;
        nombre: string;
        horaInicio: string;
        horaFinal: string;
        orden?: number | null;
      }> = await response.json();

      const catalogo = bloques.reduce<BloqueHorarioCatalogoMap>((mapa, bloque) => {
        mapa[bloque.id] = {
          nombre: bloque.nombre,
          horaInicio: bloque.horaInicio,
          horaFinal: bloque.horaFinal,
          orden: bloque.orden ?? undefined
        };
        return mapa;
      }, {});

      this.bloquesHorariosCache = { ...catalogo };

      return this.getBloquesHorarios();
  }

  getDiasSemana() {
    return DIAS_SEMANA;
  }

  getBloqueInfoById(bloqueId: number) {
   return this.bloquesHorariosCache[bloqueId] || { nombre: `Bloque ${bloqueId}`, horaInicio: 'N/A', horaFinal: 'N/A' };
  }

  getBloqueNombreById(bloqueId: number): string {
    const bloque = this.getBloqueInfoById(bloqueId);
    return bloque.nombre;
  }

  getHorarioCompleto(bloqueId: number): string {
    const bloque = this.getBloqueInfoById(bloqueId);
    return `${bloque.horaInicio} - ${bloque.horaFinal}`;
  }

  formatearDiasMultiples(dias: string[]): string {
    if (!dias || dias.length === 0) return '';
    if (dias.length === 1) return this.formatearDia(dias[0]);
    const diasFormateados = dias.map(dia => this.formatearDia(dia));
    return diasFormateados.join('-');
  }

  private formatearDia(dia: string): string {
    switch (dia) {
      case 'Lunes': return 'Lun';
      case 'Martes': return 'Mar';
      case 'Miercoles': return 'Mié';
      case 'Jueves': return 'Jue';
      case 'Viernes': return 'Vie';
      case 'Sabado': return 'Sáb';
      default: return dia;
    }
  }
}

export const horariosService = new HorariosService();