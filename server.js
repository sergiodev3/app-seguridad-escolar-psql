// server.js — punto de entrada
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import pool from './src/db/conexion.js';

import authRoutes from './src/routes/auth.routes.js';
import contactosRoutes from './src/routes/contactos.routes.js';
import reportesRoutes from './src/routes/reportes.routes.js';
import alertasRoutes from './src/routes/alertas.routes.js';
import configRoutes from './src/routes/config.routes.js';
import gruposRoutes, { puntosRouter } from './src/routes/grupos.routes.js';

const app = express();

// CORS: qué otros dominios pueden llamar a esta API desde el navegador.
// En producción, FRONTEND_URL es la dirección de Vercel (pueden ser varias separadas por coma)
const origenes = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((o) => o.trim());
app.use(cors({ origin: origenes }));

app.use(express.json());                 // middleware: convierte el cuerpo JSON en req.body
app.use(express.static('public'));       // en local, Express también sirve la VISTA

// Salud: confirma que el servidor Y la base de datos responden (útil al desplegar)
app.get('/api/salud', async (req, res) => {
  const { rows } = await pool.query('SELECT now() AS hora');
  res.json({ ok: true, hora: rows[0].hora });
});

app.use('/api/auth', authRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/config', configRoutes);
app.use('/api/puntos', puntosRouter);
app.use('/api/grupos', gruposRoutes);

// Swagger: documentación interactiva en /api-docs
const openapi = YAML.parse(readFileSync('./docs/openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Middleware de errores: va AL FINAL y recibe 4 parámetros.
// Express 5 manda aquí los errores de los controladores async automáticamente
app.use((err, req, res, next) => {
  if (err.code === '23505') {                          // PostgreSQL: valor UNIQUE repetido
    return res.status(409).json({ error: 'Ese registro ya existe' });
  }
  if (err.type === 'entity.parse.failed') {           // JSON mal escrito en la petición
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PUERTO = process.env.PORT ?? process.env.PUERTO ?? 3000;   // Railway define PORT
app.listen(PUERTO, () => console.log(`Servidor en http://localhost:${PUERTO}`));
