// src/controllers/auth.controller.js — CONTROLADOR: reglas de negocio
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuario.model.js';
import * as Config from '../models/config.model.js';

// async: el controlador ESPERA (await) al modelo, porque la BD responde por la red
export async function registro(req, res) {
  const { nombre, matricula, grupoEscolar, password, codigo } = req.body ?? {};

  if (!nombre || !matricula || !grupoEscolar || !password || !codigo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (password.length < 8) {                                         // RN-03
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (codigo !== await Config.leer('codigo_registro')) {              // RN-01
    return res.status(403).json({ error: 'Código de registro inválido' });
  }
  if (await Usuario.buscarPorMatricula(matricula)) {                 // RN-02
    return res.status(409).json({ error: 'Esa matrícula ya está registrada' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);                // nunca texto plano
  const usuario = await Usuario.crear({ nombre, matricula, grupoEscolar, passwordHash });
  res.status(201).json(usuario);
}

export async function login(req, res) {
  const { matricula, password } = req.body ?? {};
  if (!matricula || !password) {
    return res.status(400).json({ error: 'Matrícula y contraseña son obligatorias' });
  }

  const usuario = await Usuario.buscarPorMatricula(matricula);
  // Mismo mensaje en ambos casos: no revelamos si la matrícula existe
  if (!usuario || !usuario.activo || !bcrypt.compareSync(password, usuario.password_hash)) {
    return res.status(401).json({ error: 'Matrícula o contraseña incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },  // carga (payload)
    process.env.JWT_SECRETO,                                       // secreto para firmar
    { expiresIn: '8h' }                                            // caduca en una jornada
  );
  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
}

export async function yo(req, res) {
  res.json(await Usuario.buscarPorId(req.usuario.id));
}
