import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequisitionProvider } from './contexts/RequisitionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RequisitionDetail from './pages/RequisitionDetail';
import Admin from './pages/Admin';
import Klasmat from './pages/Klasmat';
import NotaFiscalPage from './pages/NotaFiscal';

function App() {
  return (
    <AuthProvider>
      <RequisitionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requisition/:id"
              element={
                <ProtectedRoute>
                  <RequisitionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/klasmat"
              element={
                <ProtectedRoute>
                  <Klasmat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lancar-nota"
              element={
                <ProtectedRoute>
                  <NotaFiscalPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </RequisitionProvider>
    </AuthProvider>
  );
}

export default App;