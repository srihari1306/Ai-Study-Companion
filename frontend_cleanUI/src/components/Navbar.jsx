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
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800">
              StudyMate
            </span>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout || handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </div>
    </nav>
  );
}