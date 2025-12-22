// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/tareas/backend/public/api/v1';
const TOKEN_STORAGE_KEY = 'access_token';

let accessToken = null;
let refreshPromise = null; // Lock para evitar múltiples refreshes simultáneos

// Inicializar token desde localStorage si existe
if (typeof window !== 'undefined') {
  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      accessToken = storedToken;
    }
  } catch (e) {
    console.warn('Error al leer token de localStorage:', e);
  }
}

export function setAccessToken(token) {
  accessToken = token;
  // Guardar en localStorage para persistencia
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Error al guardar token en localStorage:', e);
    }
  }
}

export function getAccessToken() {
  // Si no hay token en memoria, intentar obtenerlo de localStorage
  if (!accessToken && typeof window !== 'undefined') {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        accessToken = storedToken;
      }
    } catch (e) {
      console.warn('Error al leer token de localStorage:', e);
    }
  }
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  refreshPromise = null;
  // Eliminar de localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Error al eliminar token de localStorage:', e);
    }
  }
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
    
    // Mostrar error en consola siempre (para debugging)
    console.error('API Error:', {
      status: res.status,
      statusText: res.statusText,
      url: `${API_URL}${url}`,
      error: error,
      message: errorMessage,
    });
    
    throw new Error(errorMessage);
  }
  
  return res.json();
}

