import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/summary', async (req, res) => {
  const { currentWeek, history } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a clinic quality control analyst reviewing a weekly inspection.

Current week (${currentWeek.week}):
- Overall compliance: ${currentWeek.compliance}%
- Pass: ${currentWeek.totalPass}, Fail: ${currentWeek.totalFail}, N/A: ${currentWeek.totalNA}
- Room data: ${JSON.stringify(currentWeek.data)}
- Notes: ${currentWeek.notes || 'None'}

Previous weeks compliance trend: ${history.map((h) => `${h.week}: ${h.compliance}%`).join(', ')}

Room names: rm1=RM1, rm2=RM2, rm3=RM3, rm4=RM4, rm5=RM5, rm6=RM6 Triage, rm7=RM7 Sterile, rm8=RM8 OPG, sr=S.R., mwr=M.W.R.

Checklist items by index: 0=Daily checklist for room temp, 1=Daily checklist for fridge temp, 2=No expired materials, 3=Labelled materials, 4=No pic/figurine on table, 5=No materials on counter top, 6=No materials under sink, 7=No over stocking, 8=Yellow container, 9=Disinfecting rooms, 10=X-ray beam cover, 11=Normal saline, 12=No extension, 13=Clean floor, 14=Barrier film on dental chair, 15=Plastic sleeve on handpieces, 16=Bowie & Dick test, 17=DUWL, 18=PPE usage, 19=Hand hygiene, 20=Monthly material update

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
