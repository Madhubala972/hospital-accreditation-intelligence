import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntryCenter from './pages/DataEntryCenter';
import MetricsDashboard from './pages/MetricsDashboard';
import ProcessMining from './pages/ProcessMining';
import CounterfactualAnalysis from './pages/CounterfactualAnalysis';
import DigitalTwin from './pages/DigitalTwin';
import PeerBenchmark from './pages/PeerBenchmark';
import AccreditationRisk from './pages/AccreditationRisk';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import AICopilot from './pages/AICopilot';
import KanbanBoard from './pages/KanbanBoard';

const MainLayout = ({ selectedDepartment, onDepartmentChange }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar
        selectedDepartment={selectedDepartment}
        onDepartmentChange={onDepartmentChange}
        activeAlertsCount={2}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950/50">
          <Routes>
            <Route
              path="/"
              element={<Dashboard selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/data-entry"
              element={<DataEntryCenter />}
            />
            <Route
              path="/kanban"
              element={<KanbanBoard selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/metrics"
              element={<MetricsDashboard selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/process-mining"
              element={<ProcessMining selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/counterfactual"
              element={<CounterfactualAnalysis selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/digital-twin"
              element={<DigitalTwin selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/benchmarks"
              element={<PeerBenchmark selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/accreditation-risk"
              element={<AccreditationRisk selectedDepartment={selectedDepartment} />}
            />
            <Route
              path="/alerts"
              element={<Alerts selectedDepartment={selectedDepartment} />}
            />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/copilot"
              element={<AICopilot selectedDepartment={selectedDepartment} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/*"
              element={
                <MainLayout
                  selectedDepartment={selectedDepartment}
                  onDepartmentChange={setSelectedDepartment}
                />
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
