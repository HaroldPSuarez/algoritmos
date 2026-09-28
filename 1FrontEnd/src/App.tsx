import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Sedes from './pages/Sedes';
import Usuarios from './pages/Usuarios';
import Mesas from './pages/Mesas';
import Caja from './pages/Caja';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/sedes" element={<Sedes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/mesas" element={<Mesas />} />
          <Route path="/caja" element={<Caja />} />
        </Route>

        <Route path="/" element={<Navigate to="/sedes" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}