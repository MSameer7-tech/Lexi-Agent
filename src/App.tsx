
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
          <Route path="auth" element={<Auth />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
