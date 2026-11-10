// src/models/usuario.model.js — MODELO: solo consultas SQL
import pool from '../db/conexion.js';

export async function buscarPorMatricula(matricula) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE matricula = $1', [matricula]);
  return rows[0];                       // undefined si no existe
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    'SELECT id, nombre, matricula, grupo_escolar, rol FROM usuarios WHERE id = $1', [id]);
  return rows[0];
}

export async function crear({ nombre, matricula, grupoEscolar, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, matricula, grupo_escolar, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, matricula, grupo_escolar, rol`,      // devuelve la fila creada
    [nombre, matricula, grupoEscolar, passwordHash]);
  return rows[0];
}
