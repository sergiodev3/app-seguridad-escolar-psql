// src/controllers/reportes.controller.js
import * as Reporte from '../models/reporte.model.js';

const TIPOS = ['asalto', 'agresion', 'acoso', 'sospechoso', 'otro'];
const FRANJAS = ['entrada', 'salida', 'otra'];

export async function crear(req, res) {
  const { tipo, descripcion, fecha, franja, lat, lng, anonimo } = req.body ?? {};
  if (!TIPOS.includes(tipo) || !FRANJAS.includes(franja) || !descripcion || !fecha) {
    return res.status(400).json({ error: 'Revisa tipo, franja, descripción y fecha' });
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Falta la ubicación del incidente' });
  }
  // RN-04: siempre nace pendiente (lo pone la BD con DEFAULT)
  const reporte = await Reporte.crear({ usuarioId: req.usuario.id, tipo, descripcion, fecha, franja, lat, lng, anonimo });
  res.status(201).json(reporte);
}

export async function listar(req, res) {
  const redondear = (n) => Math.round(n * 1000) / 1000;          // RN-06: ≈ 100 m
  const reportes = (await Reporte.listarAprobados(req.query)).map((r) => ({
    ...r, lat: redondear(r.lat), lng: redondear(r.lng)
  }));
  res.json(reportes);
}

export async function pendientes(req, res) {
  // RN-07: si es anónimo, ni el moderador ve el nombre
  const lista = (await Reporte.listarPendientes()).map(({ autor, grupo_escolar, usuario_id, ...r }) =>
    r.anonimo ? r : { ...r, autor, grupo_escolar });
  res.json(lista);
}

export async function moderar(req, res) {
  const { estado } = req.body ?? {};
  if (!['aprobado', 'rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado debe ser aprobado o rechazado' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Reporte no encontrado' });
  const cambios = await Reporte.cambiarEstado(id, estado, req.usuario.id);
  if (cambios === 0) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json({ id, estado });
}
