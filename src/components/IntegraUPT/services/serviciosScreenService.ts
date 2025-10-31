// serviciosScreenService.ts - ARCHIVO COMPLETO CORREGIDO
import type { Horario, CursoHorario } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080';

export interface HorarioCompleto {
  id: string;
  espacioId: number;
  espacioNombre: string;
  bloqueId: number;
  bloqueNombre: string;
  horaInicio: string;
  horaFinal: string;
  diaSemana: string;
  ocupado: boolean;
  curso?: string;
  docente?: string;
}

export interface CursoConEspacio {
  id: string;
  curso: string;
  docente: string;
  espacioId: number;
  espacioNombre: string;
  bloqueId: number;
  dias: string;
  horario: string;
  estudiantes: number;
  estado: boolean;
}

// Interfaz para cursos con campos extendidos
interface CursoHorarioExtendido {
  id: number;
  curso: string;
  docente: string;
  dias: string;
  horario: string;
  ubicacion: string;
  estudiantes: number;
  estado: boolean;
  espacioId?: number;
  bloqueId?: number;
  docenteId?: number;
}

class ServiciosScreenService {
  
  /**
   * Obtiene horarios COMPLETOS de un espacio (con información de bloques y cursos)
   */
  async getHorariosCompletosPorEspacio(espacioId: number): Promise<HorarioCompleto[]> {
    try {
      console.log('🔍 Cargando horarios para espacio ID:', espacioId);
      
      // 1. Obtener horarios técnicos del espacio específico
      const horariosTecnicos = await this.fetchHorariosPorEspacio(espacioId);
      console.log('📅 Horarios técnicos encontrados:', horariosTecnicos.length);

      // 2. Obtener TODOS los cursos horarios
      const todosLosCursos = await this.fetchTodosLosCursosHorarios();
      console.log('📚 Total de cursos encontrados:', todosLosCursos.length);

      // 3. Filtrar cursos que pertenecen a ESTE espacio específico
      const cursosDelEspacio = todosLosCursos.filter(curso => 
        curso.espacioId === espacioId && curso.estado === true
      );
      console.log('🎯 Cursos de este espacio:', cursosDelEspacio.length);

      // 4. Combinar información
      const horariosCompletos = horariosTecnicos.map(horarioTecnico => {
        // Buscar curso que coincida EXACTAMENTE con este horario
        const cursoEnHorario = cursosDelEspacio.find(curso => 
          curso.espacioId === espacioId &&
          curso.bloqueId === horarioTecnico.bloqueId &&
          this.coincidenDias(curso.dias, horarioTecnico.diaSemana)
        );

        console.log(`🕒 Horario ${horarioTecnico.bloqueId}-${horarioTecnico.diaSemana}:`, 
          cursoEnHorario ? `Curso: ${cursoEnHorario.curso}` : 'Disponible');

        return {
          id: horarioTecnico.id?.toString() || `h-${horarioTecnico.bloqueId}-${horarioTecnico.diaSemana}`,
          espacioId: espacioId,
          espacioNombre: horarioTecnico.espacioNombre || `Espacio ${espacioId}`,
          bloqueId: horarioTecnico.bloqueId,
          bloqueNombre: horarioTecnico.bloqueNombre || `Bloque ${horarioTecnico.bloqueId}`,
          horaInicio: horarioTecnico.horaInicio || '08:00',
          horaFinal: horarioTecnico.horaFinal || '09:40',
          diaSemana: horarioTecnico.diaSemana,
          ocupado: cursoEnHorario ? true : horarioTecnico.ocupado,
          curso: cursoEnHorario?.curso,
          docente: cursoEnHorario?.docente
        };
      });

      console.log('✅ Horarios completos procesados:', horariosCompletos);
      return horariosCompletos;

    } catch (error) {
      console.error('❌ Error en getHorariosCompletosPorEspacio:', error);
      // Retornar array vacío en caso de error
      return [];
    }
  }

  /**
   * Verifica coincidencia de días
   */
  private coincidenDias(diasCurso: string, diaHorario: string): boolean {
    if (!diasCurso || !diaHorario) return false;
    
    const diasMap: Record<string, string> = {
      'Lun': 'Lunes',
      'Mar': 'Martes', 
      'Mié': 'Miercoles',
      'Mie': 'Miercoles',
      'Jue': 'Jueves',
      'Vie': 'Viernes',
      'Sáb': 'Sabado',
      'Sab': 'Sabado'
    };

    // Convertir días del curso (pueden ser múltiples: "Lun-Mar")
    const diasCursoArray = diasCurso.split('-').map(dia => 
      diasMap[dia.trim()] || dia.trim()
    );
    
    // Convertir día del horario
    const diaHorarioFormateado = diasMap[diaHorario] || diaHorario;

    return diasCursoArray.includes(diaHorarioFormateado);
  }

  /**
   * Obtiene todos los bloques horarios de la base de datos
   */
  async getAllBloquesHorarios(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bloques-horarios`);
      if (!response.ok) {
        // Si no existe el endpoint, intentar alternativas
        console.warn('Endpoint /api/bloques-horarios no disponible, intentando alternativas...');
        return await this.getBloquesHorariosAlternativo();
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bloques horarios:', error);
      return [];
    }
  }

  /**
   * Intentar endpoints alternativos para bloques horarios
   */
  private async getBloquesHorariosAlternativo(): Promise<any[]> {
    try {
      // Intentar diferentes endpoints posibles
      const endpoints = [
        '/api/bloques',
        '/api/horarios/bloques',
        '/api/configuracion/bloques-horarios'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`);
          if (response.ok) {
            console.log(`✅ Endpoint encontrado: ${endpoint}`);
            return await response.json();
          }
        } catch (e) {
          continue;
        }
      }
      
      // Si no hay endpoints, retornar array vacío
      console.warn('No se encontraron endpoints para bloques horarios');
      return [];
    } catch (error) {
      console.error('Error en alternativa:', error);
      return [];
    }
  }

  /**
   * Obtiene cursos con información de espacio
   */
  async getCursosConEspacio(): Promise<CursoConEspacio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const cursos: CursoHorarioExtendido[] = await response.json();
      
      // Mapear a la nueva interfaz
      return cursos.map(curso => ({
        id: curso.id.toString(),
        curso: curso.curso,
        docente: curso.docente || 'Docente no asignado',
        espacioId: curso.espacioId || 0,
        espacioNombre: `Espacio ${curso.espacioId || 'N/A'}`,
        bloqueId: curso.bloqueId || 0,
        dias: curso.dias,
        horario: curso.horario,
        estudiantes: curso.estudiantes || 0,
        estado: curso.estado
      }));

    } catch (error) {
      console.error('Error fetching cursos con espacio:', error);
      throw error;
    }
  }

  // Métodos auxiliares para fetch
  private async fetchHorariosPorEspacio(espacioId: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios/espacio/${espacioId}`);
      if (!response.ok) {
        console.error('Error fetching horarios por espacio:', response.status);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching horarios:', error);
      return [];
    }
  }

  private async fetchTodosLosCursosHorarios(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios-cursos`);
      if (!response.ok) {
        console.error('Error fetching cursos horarios:', response.status);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cursos:', error);
      return [];
    }
  }

  /**
   * Diagnóstico de endpoints disponibles
   */
  async diagnosticarEndpoints(): Promise<void> {
    console.log('=== DIAGNÓSTICO DE ENDPOINTS ===');
    
    const endpoints = [
      '/api/bloques-horarios',
      '/api/bloques', 
      '/api/horarios/bloques',
      '/api/configuracion/bloques',
      '/api/bloqueshorarios'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} funciona:`, data);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error:`, error);
      }
    }
  }
}

export const serviciosScreenService = new ServiciosScreenService();