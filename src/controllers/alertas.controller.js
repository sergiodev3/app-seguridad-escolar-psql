import * as Alerta from '../models/alerta.model.js';

export async function crear(req, res) {
  const { lat, lng } = req.body ?? {};            // la ubicación es opcional
  const alerta = await Alerta.crear(req.usuario.id,
    typeof lat === 'number' ? lat : null,
    typeof lng === 'number' ? lng : null);
  res.status(201).json(alerta);
}

export async function deHoy(req, res) {
  res.json(await Alerta.listarDeHoy());
}

export async function atender(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Alerta.marcarAtendida(id) === 0) {
    return res.status(404).json({ error: 'Alerta no encontrada' });
  }
  res.json({ id, atendida: true });
}
