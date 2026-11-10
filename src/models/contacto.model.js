import pool from '../db/conexion.js';

export async function listar(usuarioId) {
  const { rows } = await pool.query(
    'SELECT id, nombre, telefono FROM contactos WHERE usuario_id = $1 ORDER BY id', [usuarioId]);
  return rows;
}

export async function crear(usuarioId, nombre, telefono) {
  const { rows } = await pool.query(
    'INSERT INTO contactos (usuario_id, nombre, telefono) VALUES ($1, $2, $3) RETURNING id, nombre, telefono',
    [usuarioId, nombre, telefono]);
  return rows[0];
}

// Solo borra si el contacto es del mismo usuario
export async function borrar(id, usuarioId) {
  const { rowCount } = await pool.query(
    'DELETE FROM contactos WHERE id = $1 AND usuario_id = $2', [id, usuarioId]);
  return rowCount;
}
