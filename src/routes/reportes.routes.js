import { Router } from 'express';
import * as C from '../controllers/reportes.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);                 // todas las rutas de reportes requieren sesión

router.post('/', C.crear);
router.get('/', C.listar);
router.get('/pendientes', soloRol('moderador'), C.pendientes);
router.patch('/:id', soloRol('moderador'), C.moderar);

export default router;
