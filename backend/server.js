import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import checklistRoutes from './routes/checklists.js';
import aiRoutes from './routes/ai.js';

dotenv.config({ override: true });

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => res.json({ status: 'ok' }));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/ai', aiRoutes);

// Server Start
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
