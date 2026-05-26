import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { getHistory, deleteWeek } from '../api';
import { ROOMS as rooms, ROOM_NAMES as roomNames, CHECKLIST_ITEMS as checklistItems } from '../constants/checklistConfig';

const items = [...Array(checklistItems.length).keys()];

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedYears, setExpandedYears] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res);
      // Auto expand the most recent year
      if (res && res.length > 0) {
        const firstYear = res[0].week.split('-')[0];
        setExpandedYears({ [firstYear]: true });
      }
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

  // Group history items by Year
  const groupedHistory = history.reduce((acc, item) => {
    const year = item.week.split('-')[0] || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  // Sorted list of years (descending)
  const sortedYears = Object.keys(groupedHistory).sort((a, b) => b - a);

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

      <div className="history-by-year">
        {sortedYears.map((year) => {
          const isYearExpanded = !!expandedYears[year];
          const yearChecklists = groupedHistory[year];
          
          return (
            <div key={year} className="year-section card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div 
                className="year-header" 
                onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  color: 'var(--teal)',
                  padding: '0.5rem 0'
                }}
              >
                <span>📅 Year {year} ({yearChecklists.length} {yearChecklists.length === 1 ? 'week' : 'weeks'})</span>
                <span style={{ fontSize: '1rem', transition: 'transform 0.2s', transform: isYearExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
              
              {isYearExpanded && (
                <div className="history-grid" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {yearChecklists.map((h) => (
                    <div key={h.week} className="history-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
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
                            <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); navigate('/summary', { state: { week: h.week, data: h.data, notes: h.notes } }); }}>View Summary</button>
                            <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleLoad(h); }}>Load into Checklist</button>
                            <button className="btn btn-danger" onClick={(e) => handleDelete(e, h.week)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
