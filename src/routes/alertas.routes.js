import { Router } from 'express';
import * as C from '../controllers/alertas.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.post('/', C.crear);
router.get('/', soloRol('moderador'), C.deHoy);
router.patch('/:id', soloRol('moderador'), C.atender);
export default router;
