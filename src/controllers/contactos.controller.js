import * as Contacto from '../models/contacto.model.js';

export async function listar(req, res) {
  res.json(await Contacto.listar(req.usuario.id));
}

export async function crear(req, res) {
  const { nombre, telefono } = req.body ?? {};
  if (!nombre || !/^\d{10}$/.test(telefono ?? '')) {
    return res.status(400).json({ error: 'Nombre y teléfono de 10 dígitos' });
  }
  if ((await Contacto.listar(req.usuario.id)).length >= 2) {
    return res.status(409).json({ error: 'Máximo 2 contactos de confianza' });
  }
  res.status(201).json(await Contacto.crear(req.usuario.id, nombre, telefono));
}

export async function borrar(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Contacto.borrar(id, req.usuario.id) === 0) {
    return res.status(404).json({ error: 'Contacto no encontrado' });
  }
  res.status(204).end();
}
