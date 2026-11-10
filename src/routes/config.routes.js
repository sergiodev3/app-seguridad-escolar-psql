import { Router } from 'express';
import * as C from '../controllers/config.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.get('/policia', C.leerPolicia);
router.put('/policia', soloRol('moderador'), C.guardarPolicia);
export default router;
