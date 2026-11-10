// src/db/conexion.js — pool de conexiones a PostgreSQL
import pg from 'pg';

const { Pool, types } = pg;

// Las columnas DATE llegan como texto '2026-11-03' (y no como objeto Date con hora UTC)
types.setTypeParser(types.builtins.DATE, (valor) => valor);

// DATABASE_URL viene del .env en local, o de las variables de Railway en producción.
// options: cada conexión usa la hora de Monterrey, así CURRENT_DATE es "hoy" en el plantel
// (los servidores en la nube trabajan en hora UTC, 6 horas adelante)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '-c TimeZone=America/Monterrey'
});

export default pool;
