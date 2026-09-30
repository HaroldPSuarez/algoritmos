import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Caja from './pages/Caja';
import Mesas from './pages/Mesas';

import AdminLayout from './layouts/AdminLayout';
import AdminSedes from './pages/Sedes';
import AdminUsuarios from './pages/Usuarios';
import AdminProductos from './pages/Productos';
import AdminMesas from './pages/AdminMesas';
import AdminInventario from './pages/Inventario';
import AdminReportes from './pages/Reportes';
import AdminAuditoria from './pages/Auditoria';

import RoleProtectedRoute from './components/RoleProtectedRoute';
import { ROL_ADMINISTRADOR, ROL_MESERO, ROL_CAJERO } from './utils/jwt';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Panel de Administrador */}
        <Route element={<RoleProtectedRoute rolesPermitidos={[ROL_ADMINISTRADOR]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="sedes" replace />} />
            <Route path="sedes" element={<AdminSedes />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="mesas" element={<AdminMesas />} />
            <Route path="inventario" element={<AdminInventario />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="auditoria" element={<AdminAuditoria />} />
          </Route>
        </Route>

        {/* Mesero: toma de pedidos */}
        <Route element={<RoleProtectedRoute rolesPermitidos={[ROL_MESERO, ROL_ADMINISTRADOR]} />}>
          <Route path="/mesas" element={<Mesas />} />
        </Route>

        {/* Cajero: cobro */}
        <Route element={<RoleProtectedRoute rolesPermitidos={[ROL_CAJERO, ROL_ADMINISTRADOR]} />}>
          <Route path="/caja" element={<Caja />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}