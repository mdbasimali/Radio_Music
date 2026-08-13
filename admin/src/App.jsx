import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import Playlists from './pages/Playlists';
import Tracks from './pages/Tracks';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="stations" element={<Stations />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="tracks" element={<Tracks />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
