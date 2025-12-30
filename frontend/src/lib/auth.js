// lib/auth.js
import { setAccessToken, clearAccessToken } from './api';

export function login(accessToken, rememberMe = false) {
  setAccessToken(accessToken, rememberMe);
}

export function logout() {
  clearAccessToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login/';
  }
}

