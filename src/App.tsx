
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Vocabulary } from './pages/Vocabulary';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const RootGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }
  
  if (!user && !sessionStorage.getItem('lexiagent-guest')) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<RootGuard><Home /></RootGuard>} />
          <Route path="history" element={<History />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="settings" element={<Settings />} />
          <Route path="auth" element={<Auth />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
