import { motion } from 'framer-motion';
import { BookOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-4 border-purple-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <BookOpen className="text-purple-600" size={32} />
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              AI Study Companion
            </span>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout || handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </div>
    </nav>
  );
}