import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChecklistTable from '../components/ChecklistTable';
import { getWeek, saveChecklist, computeCompliance, deleteWeek } from '../api';
import { getCurrentWeekString } from '../utils/dateUtils';

const Checklist = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [week, setWeek] = useState(() => {
    if (location.state && location.state.week) {
      return location.state.week;
    }
    return getCurrentWeekString();
  });

  const [data, setData] = useState(() => {
    if (location.state && location.state.data) {
      return location.state.data;
    }
    return {};
  });

  const [notes, setNotes] = useState(() => {
    if (location.state && location.state.notes) {
      return location.state.notes;
    }
    return '';
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track if we initialized data from navigation state to skip initial fetch
  const isLoadedFromState = useRef(
    !!(location.state && location.state.week && location.state.data)
  );

  useEffect(() => {
    const loadWeek = async () => {
      if (isLoadedFromState.current) {
        isLoadedFromState.current = false;
        // Clean location.state so refresh doesn't trigger it again
        navigate(location.pathname, { replace: true, state: null });
        return;
      }

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

  const handleDeleteWeek = async () => {
    if (window.confirm(`Are you sure you want to permanently delete week ${week} from the database?`)) {
      try {
        setLoading(true);
        await deleteWeek(week);
        setData({});
        setNotes('');
        showToast('Week deleted from database successfully!');
      } catch (err) {
        alert('Failed to delete week from database. It may not exist in the database.');
      } finally {
        setLoading(false);
      }
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
            <button onClick={handleDeleteWeek} className="btn btn-danger" style={{ marginRight: 'auto' }}>Delete Week from DB</button>
            <button onClick={handleClear} className="btn btn-danger">Clear Local</button>
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
