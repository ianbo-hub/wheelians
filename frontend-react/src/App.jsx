import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Home from './pages/Home';
import AdminLayout from './pages/admin/AdminLayout';
import WhatsAppFloat from './components/ui/WhatsAppFloat';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
      <WhatsAppFloat />
    </AuthProvider>
  );
}
