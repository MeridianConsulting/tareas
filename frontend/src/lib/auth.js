// lib/auth.js
import { setAccessToken, clearAccessToken } from './api';

export function login(accessToken) {
  setAccessToken(accessToken);
}

export function logout() {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

