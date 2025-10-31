import type { Profile, ApiResponse } from '../types';

// Configuración del servicio
const BACKEND_BASE_URL = 'http://localhost:8080'; // Ajustar según tu configuración
const PERFILES_SERVICE_URL = `${BACKEND_BASE_URL}/perfiles-service/api/v1`;

// Datos de ejemplo para desarrollo (se reemplazarán por llamadas reales al backend)
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Ana García Mendoza',
    email: 'ana.garcia@upt.pe',
    career: 'Ingeniería de Sistemas',
    semester: 8,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=150&h=150&fit=crop&crop=face',
    skills: ['Java', 'React', 'Spring Boot', 'MySQL'],
    interests: ['Desarrollo Web', 'Inteligencia Artificial', 'Startup'],
    achievements: ['Primer lugar en Hackathon UPT 2024', 'Proyecto destacado en curso de IA'],
    teams: ['Club de Programación', 'Equipo de Robótica'],
    isOnline: true,
    bio: 'Estudiante apasionada por el desarrollo de software y la innovación tecnológica.',
    gpa: 16.8
  },
  {
    id: '2',
    name: 'Carlos Rodríguez Silva',
    email: 'carlos.rodriguez@upt.pe',
    career: 'Ingeniería Civil',
    semester: 6,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skills: ['AutoCAD', 'Revit', 'Project Management', 'Estructuras'],
    interests: ['Construcción Sostenible', 'BIM', 'Gestión de Proyectos'],
    achievements: ['Pasantía en empresa constructora líder', 'Certificación en BIM'],
    teams: ['Sociedad de Estudiantes de Ingeniería Civil'],
    isOnline: false,
    bio: 'Futuro ingeniero civil enfocado en construcción sostenible y tecnologías BIM.',
    gpa: 15.9
  },
  {
    id: '3',
    name: 'María Fernanda López',
    email: 'maria.lopez@upt.pe',
    career: 'Ingeniería Industrial',
    semester: 7,
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    skills: ['Lean Manufacturing', 'Six Sigma', 'Power BI', 'Python'],
    interests: ['Optimización de Procesos', 'Analítica de Datos', 'Industria 4.0'],
    achievements: ['Certificación Green Belt Six Sigma', 'Proyecto de mejora continua implementado'],
    teams: ['Círculo de Calidad', 'Grupo de Investigación en Operaciones'],
    isOnline: true,
    bio: 'Estudiante enfocada en la optimización de procesos industriales y analítica.',
    gpa: 17.2
  },
  {
    id: '4',
    name: 'Diego Herrera Quispe',
    email: 'diego.herrera@upt.pe',
    career: 'Arquitectura',
    semester: 5,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skills: ['SketchUp', 'Lumion', 'Photoshop', 'Diseño Urbano'],
    interests: ['Arquitectura Sostenible', 'Diseño Paramétrico', 'Urbanismo'],
    achievements: ['Mención honrosa concurso de diseño', 'Exposición de trabajos en galería'],
    teams: ['Taller de Arquitectura Experimental'],
    isOnline: true,
    bio: 'Estudiante de arquitectura apasionado por el diseño sostenible y la innovación.',
    gpa: 16.5
  },
  {
    id: '5',
    name: 'Sofía Martínez Torres',
    email: 'sofia.martinez@upt.pe',
    career: 'Psicología',
    semester: 9,
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    skills: ['Terapia Cognitivo-Conductual', 'Investigación', 'SPSS', 'Entrevista Clínica'],
    interests: ['Psicología Clínica', 'Neuropsicología', 'Salud Mental'],
    achievements: ['Ponencia en congreso nacional de psicología', 'Prácticas en hospital especializado'],
    teams: ['Centro de Bienestar Estudiantil'],
    isOnline: false,
    bio: 'Estudiante de psicología especializada en terapia cognitivo-conductual.',
    gpa: 17.8
  },
  {
    id: '6',
    name: 'Roberto Chávez Mamani',
    email: 'roberto.chavez@upt.pe',
    career: 'Ingeniería de Minas',
    semester: 6,
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    skills: ['AutoCAD', 'Surpac', 'Gestión Ambiental', 'Seguridad Minera'],
    interests: ['Minería Sostenible', 'Geología', 'Medio Ambiente'],
    achievements: ['Práctica en mina de cobre', 'Proyecto de remediación ambiental'],
    teams: ['Sociedad de Estudiantes de Minas'],
    isOnline: true,
    bio: 'Estudiante comprometido con la minería responsable y sostenible.',
    gpa: 16.1
  }
];

class PerfilesService {
  async getAllProfiles(): Promise<Profile[]> {
    try {
      // En desarrollo, usar datos mock
      if (process.env.NODE_ENV === 'development') {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockProfiles;
      }

      // En producción, hacer llamada real al backend
      const response = await fetch(`${PERFILES_SERVICE_URL}/profiles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Ajustar según tu sistema de auth
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<Profile[]> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Error al obtener perfiles');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // En caso de error, devolver datos mock como fallback
      return mockProfiles;
    }
  }

  async getProfileById(id: string): Promise<Profile | null> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProfiles.find(profile => profile.id === id) || null;
      }

      const response = await fetch(`${PERFILES_SERVICE_URL}/profiles/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<Profile> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Error al obtener perfil');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return mockProfiles.find(profile => profile.id === id) || null;
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        const profileIndex = mockProfiles.findIndex(p => p.id === id);
        if (profileIndex === -1) {
          throw new Error('Perfil no encontrado');
        }
        mockProfiles[profileIndex] = { ...mockProfiles[profileIndex], ...updates };
        return mockProfiles[profileIndex];
      }

      const response = await fetch(`${PERFILES_SERVICE_URL}/profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<Profile> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Error al actualizar perfil');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export const perfilesService = new PerfilesService();