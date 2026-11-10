// public/js/alerta.js — Módulo 2: botón de alerta
import { api } from './api.js';

const TIEMPO_MS = 2000;   // RN-08: mantener presionado 2 segundos

// Pide la ubicación, pero no espera más de 4 s: en una emergencia no se puede esperar
function obtenerUbicacion() {
  return new Promise((resolver) => {
    if (!navigator.geolocation) return resolver(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolver({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolver(null),                       // sin permiso → seguimos sin ubicación
      { enableHighAccuracy: true, timeout: 4000 }
    );
  });
}

async function dispararAlerta(telefono, estado) {
  estado.textContent = 'Abriendo llamada a la policía municipal...';
  estado.classList.remove('oculto');
  const ubicacion = await obtenerUbicacion();
  // Registrar la alerta NO debe impedir la llamada: si falla, se llama igual
  api('/alertas', { metodo: 'POST', datos: ubicacion ?? {} }).catch(() => {});
  location.href = `tel:${telefono}`;
}

export async function iniciarAlerta() {
  const boton = document.querySelector('#boton-alerta');
  const barra = boton.querySelector('.progreso');
  const estado = document.querySelector('#estado-alerta');
  const { telefono } = await api('/config/policia');
  let temporizador = null;

  const empezar = () => {
    barra.style.transition = `width ${TIEMPO_MS}ms linear`;
    barra.style.width = '100%';
    temporizador = setTimeout(() => dispararAlerta(telefono, estado), TIEMPO_MS);
  };
  const cancelar = () => {
    clearTimeout(temporizador);
    barra.style.transition = 'none';
    barra.style.width = '0';
  };

  boton.addEventListener('pointerdown', empezar);
  boton.addEventListener('pointerup', cancelar);       // soltó antes de 2 s
  boton.addEventListener('pointerleave', cancelar);    // deslizó el dedo fuera

  document.querySelector('#avisar-contacto').addEventListener('click', async () => {
    const [contacto] = await api('/contactos');
    if (!contacto) return alert('Primero agrega un contacto en "Mis contactos"');
    const ubicacion = await obtenerUbicacion();
    const liga = ubicacion ? ` Mi ubicación: https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}` : '';
    const texto = encodeURIComponent(`Necesito ayuda, estoy cerca de la escuela.${liga}`);
    location.href = `https://wa.me/52${contacto.telefono}?text=${texto}`;
  });
}
