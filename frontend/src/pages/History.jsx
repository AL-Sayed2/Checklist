import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { getHistory, deleteWeek } from '../api';

const rooms = ['rm1', 'rm2', 'rm3', 'rm4', 'rm5', 'rm6', 'rm7', 'rm8', 'sr', 'mwr'];
const roomNames = ['RM1', 'RM2', 'RM3', 'RM4', 'RM5', 'RM6 Triage', 'RM7 Sterile', 'RM8 OPG', 'S.R.', 'M.W.R.'];
const items = [...Array(21).keys()]; // just index placeholders for calculation

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (weekData) => {
    navigate('/', { state: { week: weekData.week, data: weekData.data, notes: weekData.notes } });
  };

  const handleDelete = async (e, weekStr) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${weekStr}?`)) {
      try {
        await deleteWeek(weekStr);
        setHistory(history.filter((h) => h.week !== weekStr));
      } catch (err) {
        alert('Failed to delete week.');
      }
    }
  };

  const getColorClass = (val) => {
    if (val >= 80) return 'green';
    if (val >= 60) return 'amber';
    return 'red';
  };

  const getRoomComplianceData = (dataObj) => {
    return rooms.map((roomKey) => {
      let pass = 0, fail = 0;
      items.forEach((itemIdx) => {
        const status = dataObj[itemIdx] ? dataObj[itemIdx][roomKey] : '';
        if (status === 'pass') pass++;
        if (status === 'fail') fail++;
      });
      const filled = pass + fail;
      return filled > 0 ? Math.round((pass / filled) * 100) : 0;
    });
  };

  const trendData = {
    labels: history.slice(0, 8).reverse().map(h => h.week),
    datasets: [
      {
        label: 'Compliance Trend %',
        data: history.slice(0, 8).reverse().map(h => h.compliance),
        borderColor: '#1a7a60',
        backgroundColor: 'rgba(26, 122, 96, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  if (loading) return <p>Loading history...</p>;

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <h2>No History Found 📉</h2>
        <p>No checklist history available yet. Complete a checklist and save it to see historical data.</p>
        <br />
        <button className="btn" onClick={() => navigate('/')}>Go to Checklist</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Historical Data</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Recent Trend (Last 8 Weeks)</h3>
        <div style={{ height: '300px' }}>
          <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }} />
        </div>
      </div>

      <div className="history-grid">
        {history.map((h) => (
          <div key={h.week} className="history-card">
            <div className="history-header" onClick={() => setExpandedWeek(expandedWeek === h.week ? null : h.week)}>
              <div className="history-week">
                {h.week}
                <span className={`badge ${getColorClass(h.compliance)}`}>{h.compliance}%</span>
              </div>
              <div className="history-stats">
                <span>Pass: {h.totalPass}</span>
                <span>Fail: {h.totalFail}</span>
                <span>N/A: {h.totalNA}</span>
                <span>{new Date(h.savedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {expandedWeek === h.week && (
              <div className="history-details">
                <div style={{ height: '200px', marginBottom: '1rem' }}>
                  <Bar
                    data={{
                      labels: roomNames,
                      datasets: [{
                        label: 'Room Compliance %',
                        data: getRoomComplianceData(h.data),
                        backgroundColor: '#2d9e7e'
                      }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }}
                  />
                </div>
                <div className="history-actions">
                  <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleLoad(h); }}>Load into Checklist</button>
                  <button className="btn btn-danger" onClick={(e) => handleDelete(e, h.week)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
