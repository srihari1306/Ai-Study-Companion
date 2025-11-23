import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            // Success
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: '600',
                borderRadius: '12px',
                padding: '16px',
              },
            },
            // Error
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: '600',
                borderRadius: '12px',
                padding: '16px',
              },
            },
            // Default
            style: {
              background: '#fff',
              color: '#1e293b',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e2e8f0',
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace/:id" element={<Workspace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;