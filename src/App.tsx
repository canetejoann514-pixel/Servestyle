import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart'; 
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Equipment from '@/pages/Equipment';
import Tours from '@/pages/Tours';
import About from '@/pages/About';
import { Toaster } from 'sonner';
import Messages from '@/pages/Messages';
import AdminMessages from '@/pages/AdminMessages';
import Packages from '@/pages/Packages'; 

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/about" element={<About />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

