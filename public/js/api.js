// public/js/api.js — TODAS las llamadas al servidor pasan por aquí
import { API_URL } from './config.js';
import { leerToken, cerrarSesion } from './sesion.js';

export async function api(ruta, { metodo = 'GET', datos } = {}) {
  const opciones = { method: metodo, headers: {} };
  const token = leerToken();
  if (token) opciones.headers.Authorization = `Bearer ${token}`;
  if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(datos);
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  if (respuesta.status === 401 && token) cerrarSesion();     // token vencido → al login
  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error ?? 'Error inesperado');
  return cuerpo;
}
