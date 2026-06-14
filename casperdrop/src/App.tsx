import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import DashboardPortal from './components/DashboardPortal';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPortal />} />
            <Route path="/auth/callback" element={<DashboardPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
