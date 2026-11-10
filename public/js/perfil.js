// public/js/perfil.js — Base: datos del usuario y contactos de confianza (máx. 2)
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina();

const MAX_CONTACTOS = 2;
const datosUsuario = document.querySelector('#datos-usuario');
const lista = document.querySelector('#lista-contactos');
const form = document.querySelector('#form-contacto');
const mensaje = document.querySelector('#mensaje');

function mostrar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.classList.remove('oculto');
}

async function pintarUsuario() {
  const yo = await api('/auth/yo');
  // textContent (no innerHTML): así un nombre con "<script>" se muestra como texto y no se ejecuta
  datosUsuario.textContent = `${yo.nombre} · Matrícula ${yo.matricula} · Grupo ${yo.grupo_escolar}`;
}

async function pintarContactos() {
  const contactos = await api('/contactos');
  lista.replaceChildren();                       // borra lo que había

  if (contactos.length === 0) {
    lista.textContent = 'Aún no tienes contactos.';
  }
  contactos.forEach((c) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';
    const texto = document.createElement('p');
    texto.textContent = `${c.nombre} · ${c.telefono}`;
    const borrar = document.createElement('button');
    borrar.className = 'secundario';
    borrar.textContent = 'Eliminar';
    borrar.addEventListener('click', () => eliminar(c.id));
    tarjeta.append(texto, borrar);
    lista.append(tarjeta);
  });

  form.classList.toggle('oculto', contactos.length >= MAX_CONTACTOS);   // RN: máximo 2
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este contacto?')) return;
  try {
    await api(`/contactos/${id}`, { metodo: 'DELETE' });
    mostrar('Contacto eliminado');
    pintarContactos();
  } catch (error) {
    mostrar(error.message, true);
  }
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(form));
  try {
    await api('/contactos', { metodo: 'POST', datos });
    form.reset();
    mostrar('Contacto agregado');
    pintarContactos();
  } catch (error) {
    mostrar(error.message, true);
  }
});

pintarUsuario();
pintarContactos();
