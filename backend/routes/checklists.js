import express from 'express';
import Checklist from '../models/Checklist.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

// GET all saved weeks sorted by savedAt descending (limit 52)
router.get('/', async (req, res) => {
  try {
    const checklists = await Checklist.find().sort({ savedAt: -1 }).limit(52);
    res.json(checklists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single week
router.get('/:week', async (req, res) => {
  try {
    const checklist = await Checklist.findOne({ week: req.params.week });
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST upsert by week
router.post('/', async (req, res) => {
  const { week, data, notes, compliance, totalPass, totalFail, totalNA } = req.body;
  try {
    const checklist = await Checklist.findOneAndUpdate(
      { week },
      { data, notes, compliance, totalPass, totalFail, totalNA, savedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE single week
router.delete('/:week', async (req, res) => {
  try {
    const deleted = await Checklist.findOneAndDelete({ week: req.params.week });
    if (!deleted) return res.status(404).json({ message: 'Checklist not found' });
    res.json({ message: 'Checklist deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
