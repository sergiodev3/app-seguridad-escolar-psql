// src/middlewares/auth.js — filtros que se ejecutan ANTES del controlador
import jwt from 'jsonwebtoken';

// 1) ¿Trae un token válido? → llena req.usuario
export function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization ?? '';   // "Bearer eyJhbGci..."
  const [tipo, token] = encabezado.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRETO); // { id, rol, nombre }
    next();                                                     // pasa al siguiente
  } catch {
    return res.status(401).json({ error: 'Sesión vencida o inválida' });
  }
}

// 2) ¿Tiene el rol necesario? Se usa DESPUÉS de verificarToken
export function soloRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}
