module.exports = function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  next();
};