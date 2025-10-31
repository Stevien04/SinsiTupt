// Configuración de la API
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://integraupt-backend.onrender.com/api'  // URL de producción
  : 'http://localhost:8080/api';                   // URL de desarrollo

// Helper para construir URLs de la API
export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;