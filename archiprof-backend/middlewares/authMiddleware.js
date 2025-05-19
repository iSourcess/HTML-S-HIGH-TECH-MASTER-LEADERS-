const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, autorización denegada' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // aquí puedes acceder al id del usuario con req.user.id
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authMiddleware;
