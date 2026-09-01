import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventaire from './pages/Inventaire';
import Maintenance from './pages/Maintenance';
import Ecme from './pages/Ecme';
import Outillage from './pages/Outillage';
import Mesures from './pages/Mesures';
import Methodes from './pages/Methodes';
import Workflow from './pages/Workflow';
import Indicateurs from './pages/Indicateurs';
import Reporting from './pages/Reporting';
import Utilisateurs from './pages/Utilisateurs';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        Chargement...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="content" style={{ maxWidth: 560, margin: '40px auto' }}>
        <div className="alert alert-error">
          Accès refusé : vous ne disposez pas des droits nécessaires pour cette page.
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventaire" element={<Inventaire />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/ecme" element={<Ecme />} />
          <Route path="/outillage" element={<Outillage />} />
          <Route path="/mesures" element={<Mesures />} />
          <Route path="/methodes" element={<Methodes />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/indicateurs" element={<Indicateurs />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/utilisateurs" element={<Protected roles={['admin']}><Utilisateurs /></Protected>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
