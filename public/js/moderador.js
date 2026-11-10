// public/js/moderador.js — Panel del moderador: alertas, reportes y configuración
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina('moderador');   // un alumno que entre aquí es enviado a inicio.html

const PLANTEL = [25.7969, -100.3134];          // CAMBIAR por las coordenadas reales
const mensaje = document.querySelector('#mensaje');
const listaAlertas = document.querySelector('#lista-alertas');
const listaReportes = document.querySelector('#lista-reportes');
const formPolicia = document.querySelector('#form-policia');

const mapa = L.map('mapa').setView(PLANTEL, 15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapa);
const capaAlertas = L.layerGroup().addTo(mapa);

function mostrar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.classList.remove('oculto');
}

// Crea un elemento con texto seguro (textContent nunca interpreta HTML)
function crear(etiqueta, texto, clase) {
  const el = document.createElement(etiqueta);
  if (texto) el.textContent = texto;
  if (clase) el.className = clase;
  return el;
}

function crearBoton(texto, alHacerClic, secundario = false) {
  const boton = crear('button', texto, secundario ? 'secundario' : '');
  boton.type = 'button';
  boton.addEventListener('click', alHacerClic);
  return boton;
}

const hora = (fecha) => new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

// ---------- Alertas (Módulo 2) ----------
async function pintarAlertas() {
  const alertas = await api('/alertas');
  listaAlertas.replaceChildren();
  capaAlertas.clearLayers();
  if (alertas.length === 0) listaAlertas.textContent = 'Sin alertas hoy.';

  alertas.forEach((a) => {
    const tieneUbicacion = a.lat !== null && a.lng !== null;
    const tarjeta = crear('div', null, 'tarjeta');
    tarjeta.append(
      crear('h3', `${hora(a.creada_en)} · ${a.nombre} (${a.grupo_escolar})`),
      crear('p', `${a.atendida ? 'Atendida' : 'SIN ATENDER'} · ${tieneUbicacion ? 'con ubicación' : 'sin ubicación'}`)
    );
    if (!a.atendida) tarjeta.append(crearBoton('Marcar como atendida', () => atender(a.id)));
    listaAlertas.append(tarjeta);

    if (tieneUbicacion) {
      L.circleMarker([a.lat, a.lng], { color: a.atendida ? '#546e7a' : '#c62828', radius: 10 })
        .bindPopup(`${hora(a.creada_en)} · ${a.atendida ? 'atendida' : 'sin atender'}`)
        .addTo(capaAlertas);
    }
  });
}

async function atender(id) {
  try {
    await api(`/alertas/${id}`, { metodo: 'PATCH' });
    pintarAlertas();
  } catch (error) {
    mostrar(error.message, true);
  }
}

// ---------- Reportes pendientes (Módulo 1) ----------
async function pintarReportes() {
  const reportes = await api('/reportes/pendientes');
  listaReportes.replaceChildren();
  if (reportes.length === 0) listaReportes.textContent = 'No hay reportes por revisar.';

  reportes.forEach((r) => {
    // RN-07: si es anónimo, el servidor ni siquiera manda el autor
    const autor = r.anonimo ? 'Anónimo' : `${r.autor} (${r.grupo_escolar})`;
    const tarjeta = crear('div', null, 'tarjeta');
    tarjeta.append(
      crear('h3', `${r.tipo} · ${String(r.fecha).slice(0, 10)} · ${r.franja}`),
      crear('p', r.descripcion),
      crear('p', `Autor: ${autor}`),
      crearBoton('Aprobar', () => moderar(r.id, 'aprobado')),
      crearBoton('Rechazar', () => moderar(r.id, 'rechazado'), true)
    );
    listaReportes.append(tarjeta);
  });
}

async function moderar(id, estado) {
  try {
    await api(`/reportes/${id}`, { metodo: 'PATCH', datos: { estado } });
    mostrar(`Reporte ${estado}`);
    pintarReportes();
  } catch (error) {
    mostrar(error.message, true);
  }
}

// ---------- Teléfono de la policía (RN-09) ----------
async function cargarTelefono() {
  const { telefono } = await api('/config/policia');
  formPolicia.telefono.value = telefono;
}

formPolicia.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  try {
    await api('/config/policia', { metodo: 'PUT', datos: { telefono: formPolicia.telefono.value } });
    mostrar('Teléfono actualizado');
  } catch (error) {
    mostrar(error.message, true);
  }
});

pintarAlertas();
pintarReportes();
cargarTelefono();
setInterval(pintarAlertas, 30000);   // revisa alertas nuevas cada 30 segundos
