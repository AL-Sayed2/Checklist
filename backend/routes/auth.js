import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.CLINIC_PASSWORD) {
    const token = jwt.sign({ role: 'clinic' }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

export default router;
