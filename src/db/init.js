// src/db/init.js — crea las tablas y carga datos iniciales (npm run db:init)
// Se puede ejecutar varias veces: no duplica ni borra datos
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import pool from './conexion.js';

const esquema = readFileSync(new URL('./esquema.sql', import.meta.url), 'utf8');
await pool.query(esquema);

// Configuración inicial (ON CONFLICT DO NOTHING: si ya existe, no la toca)
const sqlConfig = 'INSERT INTO configuracion (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING';
await pool.query(sqlConfig, ['codigo_registro', process.env.CODIGO_REGISTRO ?? 'CAMBIAME']);
await pool.query(sqlConfig, ['telefono_policia', process.env.TELEFONO_POLICIA ?? '0000000000']);

// Puntos de encuentro de ejemplo (cambiar por coordenadas reales del plantel)
const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM puntos_encuentro');
if (rows[0].n === 0) {
  const sqlPunto = 'INSERT INTO puntos_encuentro (nombre, descripcion, lat, lng) VALUES ($1, $2, $3, $4)';
  await pool.query(sqlPunto, ['Puerta principal', 'Frente a la caseta de prefectura', 25.78833, -100.330000]);
  await pool.query(sqlPunto, ['Parada de camión', 'Esquina de la avenida principal', 25.7975, -100.3120]);
}

// Moderador inicial
await pool.query(
  `INSERT INTO usuarios (nombre, matricula, grupo_escolar, password_hash, rol)
   VALUES ($1, $2, $3, $4, 'moderador')
   ON CONFLICT (matricula) DO NOTHING`,
  ['Docente moderador', 'moderador', 'DOCENTE', bcrypt.hashSync('moderador123', 10)]
);

console.log('Base de datos lista');
await pool.end();   // cierra las conexiones para que el script termine
