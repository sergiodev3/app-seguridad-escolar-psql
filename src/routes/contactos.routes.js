import { Router } from 'express';
import * as C from '../controllers/contactos.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.get('/', C.listar);
router.post('/', C.crear);
router.delete('/:id', C.borrar);
export default router;
