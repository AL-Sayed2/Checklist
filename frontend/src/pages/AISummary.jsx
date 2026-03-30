import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { getHistory, getWeek, getAISummary, computeCompliance } from '../api';

const AISummary = () => {
  const [data, setData] = useState({});
  const [week, setWeek] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadSetup();
  }, []);

  const loadSetup = async () => {
    setLoading(true);
    let activeData = location.state?.data || {};
    let activeWeek = location.state?.week;

    try {
      if (!activeWeek) {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        activeWeek = `${now.getFullYear()}-W${Math.ceil((now.getDay() + 1 + days) / 7).toString().padStart(2, '0')}`;
        const res = await getWeek(activeWeek);
        if (res && res.data) activeData = res.data;
      }
      setData(activeData);
      setWeek(activeWeek);
      setStats(computeCompliance(activeData));

      const histData = await getHistory();
      // Keep last 4 weeks for AI prompt
      setHistory(histData.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await getAISummary({
        currentWeek: {
          week: week,
          compliance: stats.compliance,
          totalPass: stats.totalPass,
          totalFail: stats.totalFail,
          totalNA: stats.totalNA,
          data: data,
          notes: location.state?.notes || ''
        },
        history: history
      });
      setSummary(res.summary);
    } catch (err) {
      setError('Failed to generate summary with Gemini AI. Check API key and backend logs.');
    } finally {
      setGenerating(false);
    }
  };

  const trendData = {
    labels: [...history.slice().reverse().map(h => h.week), week],
    datasets: [
      {
        label: 'Compliance Trend %',
        data: [...history.slice().reverse().map(h => h.compliance), stats?.compliance || 0],
        borderColor: '#1a7a60',
        backgroundColor: 'rgba(26, 122, 96, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>✨ AI Intelligence Report</h1>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Current Week: {week}</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Compliance: <strong>{stats.compliance}%</strong> | 
          Pass: <strong>{stats.totalPass}</strong> | 
          Fail: <strong>{stats.totalFail}</strong>
        </p>
        
        {!generating && !summary && (
          <button className="btn" onClick={handleGenerate} style={{ padding: '1rem 2rem', fontSize: '1.25rem' }}>
            ✨ Generate AI Summary
          </button>
        )}

        {generating && (
          <div className="ai-loading">
            <div className="spinner"></div>
            <p>Gemini is analysing your checklist data...</p>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ margin: '2rem auto', maxWidth: '600px' }}>
            {error}
            <br /><br />
            <button className="btn btn-outline" onClick={handleGenerate}>Try Again</button>
          </div>
        )}

        {summary && !generating && (
          <div className="ai-summary-card" style={{ textAlign: 'left', marginTop: '2rem' }}>
            {summary}
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button className="btn btn-outline" onClick={handleGenerate}>Regenerate</button>
            </div>
          </div>
        )}
      </div>

      {(summary || history.length > 0) && (
        <div className="card">
          <h3>Recent Compliance Trend</h3>
          <div style={{ height: '300px' }}>
            <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummary;
