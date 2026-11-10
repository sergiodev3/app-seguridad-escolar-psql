// public/js/reportar.js — Módulo 1: formulario de reporte
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina();

const PLANTEL = [25.7969, -100.3134];          // CAMBIAR por las coordenadas reales
const form = document.querySelector('#form-reporte');
const mensaje = document.querySelector('#mensaje');
let ubicacion = null;                          // { lat, lng }
let marcador = null;

const mapa = L.map('mapa').setView(PLANTEL, 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapa);

function marcar(lat, lng) {
  ubicacion = { lat, lng };
  if (marcador) marcador.setLatLng([lat, lng]);
  else marcador = L.marker([lat, lng]).addTo(mapa);
  mapa.setView([lat, lng], 17);
}

mapa.on('click', (e) => marcar(e.latlng.lat, e.latlng.lng));   // opción 1: tocar el mapa

document.querySelector('#usar-gps').addEventListener('click', () => {   // opción 2: GPS
  navigator.geolocation.getCurrentPosition(
    (pos) => marcar(pos.coords.latitude, pos.coords.longitude),
    () => alert('No se pudo obtener tu ubicación. Toca el mapa para marcarla.')
  );
});

function mostrar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.classList.remove('oculto');
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!ubicacion) return mostrar('Marca en el mapa dónde ocurrió', true);
  const datos = Object.fromEntries(new FormData(form));
  try {
    await api('/reportes', {
      metodo: 'POST',
      datos: { ...datos, anonimo: datos.anonimo === 'on', ...ubicacion }
    });
    form.reset();
    mostrar('Gracias. Tu reporte será revisado por un moderador antes de aparecer en el mapa.');
  } catch (error) {
    mostrar(error.message, true);
  }
});
