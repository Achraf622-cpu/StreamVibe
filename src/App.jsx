import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholders for future pages
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import VideoDetails from './pages/VideoDetails';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';

import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:type/:id" element={<VideoDetails />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile" element={<Profile />} />
              {/* Reuse Home for now but we could add filters via props if we had time */}
              <Route path="/movies" element={<Home />} />
              <Route path="/series" element={<Home />} />
              {/* Add more protected routes here later */}
            </Route>

          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
