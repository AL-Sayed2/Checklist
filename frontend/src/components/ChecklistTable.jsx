import React from 'react';
import { ROOMS as rooms, ROOM_NAMES as roomNames, CHECKLIST_ITEMS as items } from '../constants/checklistConfig';

const ChecklistTable = ({ data, onChange }) => {
  const getCellStatus = (itemIndex, roomKey) => {
    return data[itemIndex] ? data[itemIndex][roomKey] || '' : '';
  };

  const getButtonText = (status) => {
    if (status === 'pass') return '✓';
    if (status === 'fail') return '✗';
    if (status === 'na') return 'N/A';
    return '';
  };

  return (
    <div>
      <div className="table-container">
        <table className="checklist-table">
          <thead>
            <tr>
              <th className="item-label-cell" style={{ zIndex: 20 }}>Checklist Item</th>
              {roomNames.map((name, i) => (
                <th key={rooms[i]}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="item-label-cell">{item}</td>
                {rooms.map((roomKey) => {
                  const status = getCellStatus(index, roomKey);
                  return (
                    <td key={roomKey}>
                      <button
                        className={`cell-btn ${status}`}
                        onClick={() => onChange(index, roomKey, status)}
                      >
                        {getButtonText(status)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="legend">
        <div className="legend-item"><div className="legend-box pass"></div> Pass</div>
        <div className="legend-item"><div className="legend-box fail"></div> Fail</div>
        <div className="legend-item"><div className="legend-box na"></div> N/A</div>
      </div>
    </div>
  );
};

export default ChecklistTable;
