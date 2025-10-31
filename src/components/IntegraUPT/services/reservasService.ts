import type { Reservacion } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

export interface ReservaFormData {
  usuario: number;
  espacio: number;
  fechaReserva: string;
  bloque: number;
  descripcion: string;
  motivo?: string;
}

class ReservasService {
  async getAllReservas(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reservas:', error);
      throw error;
    }
  }

  async getReservasPorEstado(estado?: string): Promise<any[]> {
    try {
      const url = estado 
        ? `${API_BASE_URL}/api/reservas?estado=${estado}`
        : `${API_BASE_URL}/api/reservas`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reservas por estado:', error);
      throw error;
    }
  }

  async crearReserva(reservaData: ReservaFormData): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating reserva:', error);
      throw error;
    }
  }

  async aprobarReserva(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservas/${id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error aprobando reserva:', error);
      throw error;
    }
  }

  async rechazarReserva(id: number, motivo: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservas/${id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rechazando reserva:', error);
      throw error;
    }
  }

  // Método para mapear reserva de BD a formato del frontend
  mapearReservaFrontend(reservaBD: any): Reservacion {
    return {
      id: reservaBD.id.toString(),
      type: reservaBD.tipoEspacio === 'Laboratorio' ? 'laboratorio' : 'aula',
      resource: reservaBD.espacio,
      resourceId: reservaBD.espacioId?.toString(),
      date: reservaBD.fechaReserva,
      startTime: reservaBD.horaInicio,
      endTime: reservaBD.horaFin,
      status: this.mapearEstado(reservaBD.estado),
      motivo: reservaBD.motivo,
      ciclo: this.extraerCiclo(reservaBD.descripcion),
      curso: this.extraerCurso(reservaBD.descripcion),
      solicitante: reservaBD.solicitante,
      solicitanteEmail: reservaBD.correoSolicitante
    };
  }

  private mapearEstado(estadoBD: string): 'active' | 'pending' | 'cancelled' | 'approved' {
    switch (estadoBD) {
      case 'Aprobada': return 'approved';
      case 'Pendiente': return 'pending';
      case 'Cancelado': return 'cancelled';
      case 'Rechazada': return 'cancelled';
      default: return 'pending';
    }
  }

  private extraerCiclo(descripcion: string): string {
    // Implementar lógica para extraer ciclo de la descripción
    const match = descripcion.match(/Ciclo:\s*([IVX]+)/i);
    return match ? match[1] : '';
  }

  private extraerCurso(descripcion: string): string {
    // Implementar lógica para extraer curso de la descripción
    const match = descripcion.match(/Curso:\s*([^-]+)/i);
    return match ? match[1].trim() : descripcion;
  }
}

export const reservasService = new ReservasService();