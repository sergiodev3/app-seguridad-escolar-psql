// src/routes/auth.routes.js — RUTAS: URL + método → middleware → controlador
import { Router } from 'express';
import { registro, login, yo } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();
router.post('/registro', registro);
router.post('/login', login);
router.get('/yo', verificarToken, yo);

export default router;
