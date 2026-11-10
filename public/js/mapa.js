// public/js/mapa.js — Módulo 1: mapa de zonas (L viene de leaflet.js)
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina();

const PLANTEL = [25.7969, -100.3134];          // CAMBIAR por las coordenadas reales
const COLORES = { asalto: '#c62828', agresion: '#ef6c00', acoso: '#6a1b9a', sospechoso: '#1565c0', otro: '#546e7a' };

const mapa = L.map('mapa').setView(PLANTEL, 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(mapa);
L.marker(PLANTEL).addTo(mapa).bindPopup('Plantel');

const capaZonas = L.layerGroup().addTo(mapa);
const filtros = document.querySelector('#filtros');

async function pintarZonas() {
  capaZonas.clearLayers();
  const parametros = new URLSearchParams(new FormData(filtros)).toString();
  const reportes = await api(`/reportes?${parametros}`);
  reportes.forEach((r) => {
    L.circle([r.lat, r.lng], { radius: 100, color: COLORES[r.tipo], fillOpacity: 0.25 })
      .bindPopup(`<b>${r.tipo}</b><br>${r.fecha} · ${r.franja}`)
      .addTo(capaZonas);
  });
}

filtros.addEventListener('change', pintarZonas);
pintarZonas();
