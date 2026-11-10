// public/js/grupos.js — Módulo 3: grupos para caminar juntos
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

const usuario = protegerPagina();

const lista = document.querySelector('#lista-grupos');
const form = document.querySelector('#form-grupo');
const selectPunto = document.querySelector('#puntoId');
const mensaje = document.querySelector('#mensaje');

function mostrar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.classList.remove('oculto');
}

// RN-13: el punto se elige de la lista del moderador, nunca se escribe un domicilio
async function cargarPuntos() {
  const puntos = await api('/puntos');
  puntos.forEach((p) => selectPunto.append(new Option(`${p.nombre} — ${p.descripcion ?? ''}`, p.id)));
}

function crearBoton(texto, alHacerClic, secundario = false) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = texto;
  if (secundario) boton.className = 'secundario';
  boton.addEventListener('click', alHacerClic);
  return boton;
}

async function pintarGrupos() {
  const grupos = await api('/grupos');
  lista.replaceChildren();
  if (grupos.length === 0) lista.textContent = 'Todavía no hay grupos hoy. ¡Crea el primero!';

  grupos.forEach((g) => {
    const soyIntegrante = g.miembros.some((m) => m.id === usuario.id);
    const lleno = g.integrantes >= g.cupo;

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';

    const titulo = document.createElement('h3');
    titulo.textContent = `${g.ruta} · ${g.franja}`;
    const detalle = document.createElement('p');
    detalle.textContent = `Punto: ${g.punto} · ${g.integrantes}/${g.cupo} integrantes`;
    const miembros = document.createElement('p');
    miembros.textContent = g.miembros.map((m) => `${m.nombre} (${m.grupo_escolar})`).join(', ');

    tarjeta.append(titulo, detalle, miembros);

    if (soyIntegrante) tarjeta.append(crearBoton('Salir del grupo', () => salir(g.id), true));
    else if (!lleno) tarjeta.append(crearBoton('Unirme', () => unirse(g.id)));
    else tarjeta.append(Object.assign(document.createElement('p'), { textContent: 'Grupo lleno' }));

    lista.append(tarjeta);
  });
}

async function unirse(id) {
  try {
    const { mensaje: texto } = await api(`/grupos/${id}/unirse`, { metodo: 'POST' });
    mostrar(texto);
  } catch (error) {
    mostrar(error.message, true);                // por ejemplo: alguien ocupó el último lugar
  }
  pintarGrupos();
}

async function salir(id) {
  try {
    await api(`/grupos/${id}/unirse`, { metodo: 'DELETE' });
    mostrar('Saliste del grupo');
  } catch (error) {
    mostrar(error.message, true);
  }
  pintarGrupos();
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(form));
  try {
    await api('/grupos', {
      metodo: 'POST',
      // FormData siempre entrega texto: el servidor espera números enteros
      datos: { ...datos, puntoId: Number(datos.puntoId), cupo: Number(datos.cupo) }
    });
    form.reset();
    mostrar('Grupo creado. Ya eres su primer integrante.');
    pintarGrupos();
  } catch (error) {
    mostrar(error.message, true);
  }
});

cargarPuntos();
pintarGrupos();
