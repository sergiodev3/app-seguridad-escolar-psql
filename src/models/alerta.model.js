import pool from '../db/conexion.js';

export async function crear(usuarioId, lat, lng) {
  const { rows } = await pool.query(
    'INSERT INTO alertas (usuario_id, lat, lng) VALUES ($1, $2, $3) RETURNING *',
    [usuarioId, lat ?? null, lng ?? null]);
  return rows[0];
}

export async function listarDeHoy() {
  const { rows } = await pool.query(
    `SELECT a.*, u.nombre, u.grupo_escolar
     FROM alertas a JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.creada_en::date = CURRENT_DATE
     ORDER BY a.creada_en DESC`);
  return rows;
}

export async function marcarAtendida(id) {
  const { rowCount } = await pool.query('UPDATE alertas SET atendida = TRUE WHERE id = $1', [id]);
  return rowCount;
}
