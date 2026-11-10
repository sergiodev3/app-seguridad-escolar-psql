import { Router } from 'express';
import * as C from '../controllers/grupos.controller.js';
import { verificarToken } from '../middlewares/auth.js';

export const puntosRouter = Router().get('/', verificarToken, C.puntos);

const router = Router();
router.use(verificarToken);
router.get('/', C.listar);
router.post('/', C.crear);
router.post('/:id/unirse', C.unirse);
router.delete('/:id/unirse', C.salir);
export default router;
