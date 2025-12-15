// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/tareas/backend/public/api/v1';

let accessToken = null;
let refreshPromise = null; // Lock para evitar múltiples refreshes simultáneos

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  refreshPromise = null;
}

async function refreshToken() {
  // Si ya hay un refresh en curso, esperar a que termine
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // para cookie HttpOnly
      });
      
      if (!res.ok) {
        throw new Error('Refresh failed');
      }
      
      const data = await res.json();
      setAccessToken(data.data.access_token);
      return data.data.access_token;
    } catch (error) {
      clearAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Bootstrap: intenta obtener access token desde refresh cookie al iniciar
export async function bootstrapAuth() {
  try {
    const token = await refreshToken();
    return token;
  } catch (error) {
    // Si no hay refresh token válido, no hacer nada (usuario debe hacer login)
    return null;
  }
}

export async function apiRequest(url, options = {}) {
  const token = getAccessToken();
  
  // Obtener CSRF token de cookie (si existe)
  const csrfToken = typeof document !== 'undefined' 
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1]
    : null;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers,
    },
    credentials: 'include',
  };
  
  let res = await fetch(`${API_URL}${url}`, config);
  
  // Si 401, intentar refresh (incluso si no hay token en memoria)
  if (res.status === 401) {
    try {
      const newToken = await refreshToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(`${API_URL}${url}`, config);
      }
    } catch (error) {
      // Si el refresh falla, lanzar error
      const errorData = await res.json().catch(() => ({ error: { message: 'Unauthorized' } }));
      throw new Error(errorData.error?.message || 'Unauthorized');
    }
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Error desconocido' } }));
    let errorMessage = error.error?.message || `Error ${res.status}: ${res.statusText}`;
    
    // Traducir mensajes comunes de error a español
    const errorTranslations = {
      'Invalid credentials': 'Credenciales inválidas. Verifica tu correo y contraseña.',
      'Unauthorized': 'No autorizado. Por favor, inicia sesión nuevamente.',
      'Forbidden': 'No tienes permisos para realizar esta acción.',
      'Not found': 'Recurso no encontrado.',
      'Internal server error': 'Error del servidor. Por favor, intenta más tarde.'
    };
    
    errorMessage = errorTranslations[errorMessage] || errorMessage;
    
    // Solo mostrar en consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', errorMessage);
    }
    
    throw new Error(errorMessage);
  }
  
  return res.json();
}

