// src/models/grupo.model.js
import pool from '../db/conexion.js';

export async function puntosActivos() {
  const { rows } = await pool.query(
    'SELECT id, nombre, descripcion, lat, lng FROM puntos_encuentro WHERE activo = TRUE ORDER BY id');
  return rows;
}

export async function puntoExiste(id) {
  const { rowCount } = await pool.query(
    'SELECT id FROM puntos_encuentro WHERE id = $1 AND activo = TRUE', [id]);
  return rowCount > 0;
}

// RN-12: solo grupos de hoy. RN-14: integrantes solo con nombre y grupo escolar
export async function listarDeHoy() {
  const { rows: grupos } = await pool.query(`
    SELECT g.id, g.ruta, g.franja, g.cupo, p.nombre AS punto, p.lat, p.lng,
           COUNT(gi.usuario_id)::int AS integrantes
    FROM grupos g
    JOIN puntos_encuentro p ON p.id = g.punto_id
    LEFT JOIN grupo_integrantes gi ON gi.grupo_id = g.id
    WHERE g.fecha = CURRENT_DATE
    GROUP BY g.id, p.id
    ORDER BY g.franja, g.ruta`);

  for (const g of grupos) {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.grupo_escolar FROM grupo_integrantes gi
       JOIN usuarios u ON u.id = gi.usuario_id WHERE gi.grupo_id = $1`, [g.id]);
    g.miembros = rows;
  }
  return grupos;
}

// Transacción: el grupo y su primer integrante se guardan juntos, o ninguno
export async function crear({ creadorId, puntoId, ruta, franja, cupo }) {
  const cliente = await pool.connect();          // una sola conexión para toda la transacción
  try {
    await cliente.query('BEGIN');
    const { rows } = await cliente.query(
      `INSERT INTO grupos (creador_id, punto_id, ruta, franja, cupo)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [creadorId, puntoId, ruta, franja, cupo]);
    const id = rows[0].id;
    await cliente.query(
      'INSERT INTO grupo_integrantes (grupo_id, usuario_id) VALUES ($1, $2)', [id, creadorId]);
    await cliente.query('COMMIT');
    return id;
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();                           // devuelve la conexión al pool
  }
}

// RN-10 y RN-11 dentro de una transacción. FOR UPDATE "aparta" el grupo:
// si dos alumnos se unen al mismo tiempo, el segundo espera a que termine el primero
export async function unirse(grupoId, usuarioId) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const { rows } = await cliente.query(
      'SELECT cupo FROM grupos WHERE id = $1 AND fecha = CURRENT_DATE FOR UPDATE', [grupoId]);
    const grupo = rows[0];
    if (!grupo) { await cliente.query('ROLLBACK'); return 'no-existe'; }

    const ya = await cliente.query(
      'SELECT 1 FROM grupo_integrantes WHERE grupo_id = $1 AND usuario_id = $2', [grupoId, usuarioId]);
    if (ya.rowCount > 0) { await cliente.query('ROLLBACK'); return 'ya-integrante'; }

    const { rows: conteo } = await cliente.query(
      'SELECT COUNT(*)::int AS n FROM grupo_integrantes WHERE grupo_id = $1', [grupoId]);
    if (conteo[0].n >= grupo.cupo) { await cliente.query('ROLLBACK'); return 'lleno'; }

    await cliente.query(
      'INSERT INTO grupo_integrantes (grupo_id, usuario_id) VALUES ($1, $2)', [grupoId, usuarioId]);
    await cliente.query('COMMIT');
    return 'ok';
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

export async function salir(grupoId, usuarioId) {
  const { rowCount } = await pool.query(
    'DELETE FROM grupo_integrantes WHERE grupo_id = $1 AND usuario_id = $2', [grupoId, usuarioId]);
  return rowCount;
}
