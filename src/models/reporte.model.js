// src/models/reporte.model.js
import pool from '../db/conexion.js';

export async function crear(r) {
  const { rows } = await pool.query(
    `INSERT INTO reportes (usuario_id, tipo, descripcion, fecha, franja, lat, lng, anonimo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, estado`,
    [r.usuarioId, r.tipo, r.descripcion, r.fecha, r.franja, r.lat, r.lng, Boolean(r.anonimo)]);
  return rows[0];
}

// RN-05: solo aprobados. Los filtros se agregan con parámetros ($1, $2), nunca pegando texto
export async function listarAprobados({ tipo, franja }) {
  let sql = "SELECT id, tipo, fecha, franja, lat, lng FROM reportes WHERE estado = 'aprobado'";
  const params = [];
  if (tipo)   { params.push(tipo);   sql += ` AND tipo = $${params.length}`; }
  if (franja) { params.push(franja); sql += ` AND franja = $${params.length}`; }
  const { rows } = await pool.query(sql + ' ORDER BY fecha DESC', params);
  return rows;
}

export async function listarPendientes() {
  const { rows } = await pool.query(
    `SELECT r.*, u.nombre AS autor, u.grupo_escolar
     FROM reportes r JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.estado = 'pendiente' ORDER BY r.creado_en`);
  return rows;
}

export async function cambiarEstado(id, estado, moderadorId) {
  const { rowCount } = await pool.query(
    'UPDATE reportes SET estado = $1, moderado_por = $2 WHERE id = $3',
    [estado, moderadorId, id]);
  return rowCount;                      // 0 si el id no existe
}
