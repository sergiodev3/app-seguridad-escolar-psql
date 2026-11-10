import * as Config from '../models/config.model.js';

export async function leerPolicia(req, res) {
  res.json({ telefono: await Config.leer('telefono_policia') });
}

export async function guardarPolicia(req, res) {         // RN-09
  const { telefono } = req.body ?? {};
  if (!/^\d{10}$/.test(telefono ?? '')) {
    return res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' });
  }
  await Config.guardar('telefono_policia', telefono);
  res.json({ telefono });
}
