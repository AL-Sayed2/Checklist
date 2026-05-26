import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { computeCompliance, getWeek } from '../api';
import { ROOMS as rooms, ROOM_NAMES as roomNames, CHECKLIST_ITEMS as items } from '../constants/checklistConfig';
import { getCurrentWeekString } from '../utils/dateUtils';

const Summary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [week, setWeek] = useState(() => {
    if (location.state && location.state.week) {
      return location.state.week;
    }
    return getCurrentWeekString();
  });
  const [data, setData] = useState({});
  const [stats, setStats] = useState({ compliance: 0, totalPass: 0, totalFail: 0, totalNA: 0, totalEmpty: 210 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFromStateOrAPI = async () => {
      let activeData = {};
      if (location.state && location.state.data) {
        activeData = location.state.data;
      } else {
        try {
          const res = await getWeek(week);
          if (res && res.data) activeData = res.data;
        } catch (err) {}
      }
      setData(activeData);
      setStats(computeCompliance(activeData));
      setLoading(false);
    };
    loadFromStateOrAPI();
  }, [location.state, week]);

  const getColorClass = (val) => {
    if (val >= 80) return 'green';
    if (val >= 60) return 'amber';
    return 'red';
  };

  const getColorHex = (val) => {
    if (val >= 80) return '#1e8a4a';
    if (val >= 60) return '#d4860f';
    return '#c0392b';
  };

  const getRoomComplianceData = () => {
    return rooms.map((roomKey) => {
      let pass = 0, fail = 0;
      items.forEach((_, itemIdx) => {
        const status = data[itemIdx] ? data[itemIdx][roomKey] : '';
        if (status === 'pass') pass++;
        if (status === 'fail') fail++;
      });
      const filled = pass + fail;
      return filled > 0 ? Math.round((pass / filled) * 100) : 0;
    });
  };

  const getItemComplianceData = () => {
    return items.map((_, itemIdx) => {
      let pass = 0, fail = 0;
      rooms.forEach((roomKey) => {
        const status = data[itemIdx] ? data[itemIdx][roomKey] : '';
        if (status === 'pass') pass++;
        if (status === 'fail') fail++;
      });
      const filled = pass + fail;
      return filled > 0 ? Math.round((pass / filled) * 100) : 0;
    });
  };

  const roomComplianceScores = getRoomComplianceData();

  const barChartData = {
    labels: roomNames,
    datasets: [
      {
        label: 'Compliance %',
        data: roomComplianceScores,
        backgroundColor: roomComplianceScores.map(getColorHex),
      }
    ]
  };

  const donutData = {
    labels: ['Pass', 'Fail', 'N/A'],
    datasets: [
      {
        data: [stats.totalPass, stats.totalFail, stats.totalNA],
        backgroundColor: ['#1e8a4a', '#c0392b', '#94a3b8']
      }
    ]
  };

  const horizontalBarData = {
    labels: items.map(t => t.split('.')[1] || t),
    datasets: [
      {
        label: 'Item Compliance %',
        data: getItemComplianceData(),
        backgroundColor: '#1a7a60'
      }
    ]
  };

  const getFailedItemsList = () => {
    const failedList = [];
    items.forEach((item, itemIdx) => {
      const failedRooms = [];
      rooms.forEach((roomKey, roomIdx) => {
        const status = data[itemIdx] ? data[itemIdx][roomKey] : '';
        if (status === 'fail') failedRooms.push(roomNames[roomIdx]);
      });
      if (failedRooms.length > 0) {
        failedList.push({ item, rooms: failedRooms });
      }
    });
    return failedList;
  };

  const failedItemsList = getFailedItemsList();

  if (loading) return <p>Loading summary...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard Summary — {week}</h1>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Checklist</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Overall Compliance</div>
          <div className={`stat-value ${getColorClass(stats.compliance)}`}>{stats.compliance}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Pass</div>
          <div className="stat-value green">{stats.totalPass}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Fail</div>
          <div className="stat-value red">{stats.totalFail}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total N/A</div>
          <div className="stat-value" style={{ color: '#64748b' }}>{stats.totalNA}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Not Checked</div>
          <div className="stat-value" style={{ color: '#cbd5e1' }}>{stats.totalEmpty}</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Room Compliance</h3>
          <Bar data={barChartData} options={{ responsive: true, scales: { y: { min: 0, max: 100 } } }} />
        </div>
        <div className="chart-card">
          <h3>Status Breakdown</h3>
          <Doughnut data={donutData} options={{ responsive: true, layout: { padding: 20 } }} />
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: '2rem' }}>
        <h3>Item Compliance Overview</h3>
        <div style={{ height: '600px' }}>
          <Bar 
            data={horizontalBarData} 
            options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { min: 0, max: 100 } } }} 
          />
        </div>
      </div>

      {failedItemsList.length > 0 && (
        <div className="failed-items-list">
          <h3>Alerts: Failed Items</h3>
          {failedItemsList.map((fi, i) => (
            <div key={i} className="failed-item">
              <strong>{fi.item}</strong>
              <div className="rooms">Failed in: {fi.rooms.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Summary;
