import pool from '../db/conexion.js';

export async function leer(clave) {
  const { rows } = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', [clave]);
  return rows[0]?.valor;
}

export async function guardar(clave, valor) {
  await pool.query(
    `INSERT INTO configuracion (clave, valor) VALUES ($1, $2)
     ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`, [clave, valor]);
}
