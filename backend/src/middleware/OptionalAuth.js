const jwt = require('jsonwebtoken');

// Não exige conta — se vier um token válido, anexa o utilizador a req.user.
// Se não vier, ou for inválido, segue em frente sem bloquear (utilizador anónimo).
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // token inválido/expirado — continua como anónimo, não bloqueia
  }
  next();
}

// Para rotas que exigem conta de facto (baixar, assinar)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'É necessário criar uma conta para continuar' });

  const token = authHeader.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Sessão inválida, faça login novamente' });
  }
}

module.exports = { optionalAuth, requireAuth };
