// src/controllers/grupos.controller.js
import * as Grupo from '../models/grupo.model.js';

export async function puntos(req, res) {
  res.json(await Grupo.puntosActivos());
}

export async function listar(req, res) {
  res.json(await Grupo.listarDeHoy());
}

export async function crear(req, res) {
  const { puntoId, ruta, franja, cupo } = req.body ?? {};
  if (!ruta || !['entrada', 'salida'].includes(franja)) {
    return res.status(400).json({ error: 'Indica la ruta y si es entrada o salida' });
  }
  if (!Number.isInteger(cupo) || cupo < 2 || cupo > 10) {           // RN-10
    return res.status(400).json({ error: 'El cupo debe ser de 2 a 10' });
  }
  if (!Number.isInteger(puntoId) || !(await Grupo.puntoExiste(puntoId))) {   // RN-13
    return res.status(400).json({ error: 'Elige un punto de encuentro de la lista' });
  }
  const id = await Grupo.crear({ creadorId: req.usuario.id, puntoId, ruta, franja, cupo });
  res.status(201).json({ id });
}

export async function unirse(req, res) {
  const id = Number(req.params.id);
  const resultado = Number.isInteger(id) ? await Grupo.unirse(id, req.usuario.id) : 'no-existe';
  const respuestas = {
    'no-existe':     [404, { error: 'El grupo no existe o ya caducó' }],
    'ya-integrante': [409, { error: 'Ya eres integrante de este grupo' }],
    'lleno':         [409, { error: 'El grupo está lleno' }],
    'ok':            [201, { mensaje: 'Te uniste al grupo' }]
  };
  const [codigo, cuerpo] = respuestas[resultado];
  res.status(codigo).json(cuerpo);
}

export async function salir(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Grupo.salir(id, req.usuario.id) === 0) {
    return res.status(404).json({ error: 'No estás en ese grupo' });
  }
  res.status(204).end();
}
