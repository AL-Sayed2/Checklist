import React from 'react';

const rooms = ['rm1', 'rm2', 'rm3', 'rm4', 'rm5', 'rm6', 'rm7', 'rm8', 'sr', 'mwr'];
const roomNames = ['RM1', 'RM2', 'RM3', 'RM4', 'RM5', 'RM6 Triage', 'RM7 Sterile', 'RM8 OPG', 'S.R.', 'M.W.R.'];
const items = [
  '1. Daily checklist for room temp.',
  '2. Daily checklist for fridge temp.',
  '3. No expired materials in the room',
  '4. There is labelled on each materials',
  '5. No pic. & figurine on the table',
  '6. No materials & inst. on the counter top',
  '7. No any materials under the sink',
  '8. No over stocking in the room',
  '9. Yellow container 28 days or 3/4 of the redline',
  '10. Disinfecting the rooms properly',
  '11. X-ray beam cover',
  '12. Normal saline to discard end of the day (24 hrs)',
  '13. No extension in the room',
  '14. Clean floor',
  '15. Barrier film on dental chair',
  '16. Plastic sleeve on handpieces',
  '17. Bowie & Dick test / Spore test / Autoclave logsheet',
  '18. DUWL (dental unit waterline)',
  '19. Proper usage of PPE',
  '20. Proper Hand hygiene / clean and short nails',
  '21. Monthly Material Update'
];

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
