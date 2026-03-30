import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid Token' });
    }
  } else {
    res.status(401).json({ message: 'No Token Provided' });
  }
};

export default authMiddleware;
