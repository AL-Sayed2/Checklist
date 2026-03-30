import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Checklist from './pages/Checklist';
import Summary from './pages/Summary';
import History from './pages/History';
import AISummary from './pages/AISummary';

import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <div className="app-container">
                  <Routes>
                    <Route path="/" element={<Checklist />} />
                    <Route path="/summary" element={<Summary />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/ai-summary" element={<AISummary />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
