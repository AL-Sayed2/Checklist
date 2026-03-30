import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChecklistTable from '../components/ChecklistTable';
import { getWeek, saveChecklist, computeCompliance } from '../api';

const Checklist = () => {
  const navigate = useNavigate();
  const [week, setWeek] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((now.getDay() + 1 + days) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  });

  const [data, setData] = useState({});
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWeek = async () => {
      try {
        setLoading(true);
        const saved = await getWeek(week);
        if (saved && saved.data) {
          setData(saved.data);
          setNotes(saved.notes || '');
        } else {
          setData({});
          setNotes('');
        }
      } catch (err) {
        // Not found is fine, means empty week
        setData({});
        setNotes('');
      } finally {
        setLoading(false);
      }
    };
    loadWeek();
  }, [week]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (itemIndex, roomKey, currentStatus) => {
    const nextStatus = {
      '': 'pass',
      'pass': 'fail',
      'fail': 'na',
      'na': ''
    }[currentStatus || ''];

    setData((prev) => {
      const newData = { ...prev };
      if (!newData[itemIndex]) newData[itemIndex] = {};
      newData[itemIndex] = { ...newData[itemIndex], [roomKey]: nextStatus };
      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const stats = computeCompliance(data);
      const payload = {
        week,
        data,
        notes,
        compliance: stats.compliance,
        totalPass: stats.totalPass,
        totalFail: stats.totalFail,
        totalNA: stats.totalNA
      };
      await saveChecklist(payload);
      showToast('Checklist saved successfully!');
    } catch (err) {
      alert('Failed to save checklist.');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all cells for this week?')) {
      setData({});
      setNotes('');
    }
  };

  const handleViewSummary = () => {
    navigate('/summary', { state: { week, data, notes } });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Weekly Inspector</h1>
        <input 
          type="week" 
          value={week} 
          onChange={(e) => setWeek(e.target.value)} 
          style={{ width: 'auto' }}
        />
      </div>

      {loading ? (
        <p>Loading week data...</p>
      ) : (
        <div className="card">
          <ChecklistTable data={data} onChange={handleChange} />
          
          <div className="notes-container">
            <label>Notes & Observations</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Any issues or repair requests..."
            />
          </div>

          <div className="actions-row">
            <button onClick={handleClear} className="btn btn-danger">Clear</button>
            <button onClick={handleViewSummary} className="btn btn-outline">View Summary</button>
            <button onClick={handleSave} className="btn">Save to Database</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
};

export default Checklist;
