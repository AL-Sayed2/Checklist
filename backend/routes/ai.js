import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authMiddleware from '../middleware/auth.js';
import { ROOMS, ROOM_NAMES, CHECKLIST_ITEMS } from '../config/constants.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/summary', async (req, res) => {
  const { currentWeek, history } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const roomMapping = ROOMS.map((r, i) => `${r}=${ROOM_NAMES[i]}`).join(', ');
    const itemMapping = CHECKLIST_ITEMS.map((item, i) => `${i}=${item.split('. ')[1] || item}`).join(', ');

    const prompt = `You are a clinic quality control analyst reviewing a weekly inspection.

Current week (${currentWeek.week}):
- Overall compliance: ${currentWeek.compliance}%
- Pass: ${currentWeek.totalPass}, Fail: ${currentWeek.totalFail}, N/A: ${currentWeek.totalNA}
- Room data: ${JSON.stringify(currentWeek.data)}
- Notes: ${currentWeek.notes || 'None'}

Previous weeks compliance trend: ${history.map((h) => `${h.week}: ${h.compliance}%`).join(', ')}

Room names: ${roomMapping}

Checklist items by index: ${itemMapping}

Write a professional 4-6 sentence summary covering:
1. Overall compliance this week and whether it improved or declined vs the trend
2. Which specific rooms had the most failures (mention room names, not keys)
3. Which checklist items failed most frequently across rooms
4. One clear, actionable recommendation for next week
Use plain professional English. No markdown, no bullet points, no headers. Just flowing sentences.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({ summary: responseText });
  } catch (err) {
    res.status(500).json({ message: 'Error generating AI summary', error: err.message });
  }
});

export default router;
