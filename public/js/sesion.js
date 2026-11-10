// public/js/sesion.js — guardar y leer la sesión en el navegador
export const leerToken = () => localStorage.getItem('token');
export const leerUsuario = () => JSON.parse(localStorage.getItem('usuario') ?? 'null');

export function guardarSesion({ token, usuario }) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.clear();
  location.href = 'index.html';
}

// Llamar al inicio de cada página privada. OJO: la protección REAL es la del servidor.
export function protegerPagina(rol) {
  const usuario = leerUsuario();
  if (!leerToken() || !usuario) return cerrarSesion();
  if (rol && usuario.rol !== rol) location.href = 'inicio.html';
  return usuario;
}
