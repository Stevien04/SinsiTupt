export interface Profile {
  id: string;
  name: string;
  email: string;
  career: string;
  semester: number;
  profileImage: string;
  skills: string[];
  interests: string[];
  achievements: string[];
  teams: string[];
  isOnline: boolean;
  bio?: string;
  gpa?: number;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Espacio {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string;
  tipo: 'Laboratorio' | 'Aula';
  capacidad: number;
  equipamiento: string;
  facultad: string;
  escuela: string;
  estado: string; // 'Disponible' | 'En Mantenimiento'
}

// HORARIOS TÉCNICOS
export interface Horario {
  id: string;
  espacioId: number;
  espacioNombre: string;
  espacioCodigo: string;
  bloqueId: number;
  bloqueNombre: string;
  horaInicio: string;
  horaFinal: string;
  diaSemana: string;
  ocupado: boolean;
}

export interface BloqueHorario {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFinal: string;
}

// HORARIOS DE CURSOS
export interface CursoHorario {
  id: string;
  curso: string;
  docente: string;
  dias: string;
  horario: string;
  ubicacion: string;
  estudiantes: number;
  estado: boolean;
  // Aux
  espacioId?: number;
  bloqueId?: number;
  docenteId?: number;
  fechaInicio?: string;
  fechaFin?: string;
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

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  codigo: string;
  email: string;
  tipoDocumento: string;
  numeroDocumento: string;
  rolId: number;
  facultadId: number;
  escuelaId: number;
  celular: string;
  genero: boolean;
  estado: number;
  sesion: boolean;
}

export interface Reservacion {
  id: string;
  type: 'laboratorio' | 'aula' | 'psicologia';
  resource: string;
  resourceId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'pending' | 'cancelled' | 'approved' | 'rejected';
  motivo?: string;
  ciclo?: string;
  curso?: string;
  solicitante?: string;
  solicitanteEmail?: string;
}

export interface ReservacionFormData {
  usuario: number;
  espacio: number;
  fechaReserva: string;
  bloque: number;
  descripcion: string;
  motivo?: string;
  ciclo?: string;
  curso?: string;
}