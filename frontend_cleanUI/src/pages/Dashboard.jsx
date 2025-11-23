import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Calendar, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', deadline: '' });
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data);
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!newWorkspace.name || !newWorkspace.deadline) {
      toast.error('Please enter both workspace name and deadline');
      return;
    }

    try {
      const response = await api.post('/workspaces', {
        name: newWorkspace.name,
        deadline: newWorkspace.deadline
      });
      
      toast.success('Workspace created! 🎉');
      
      // Reload workspaces to get complete data with created_at
      await loadWorkspaces();
      
      setShowCreateModal(false);
      setNewWorkspace({ name: '', deadline: '' });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create workspace';
      toast.error(errorMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleDeleteWorkspace = async (e, workspaceId, workspaceName) => {
    e.stopPropagation(); // Prevent workspace navigation
    
    if (!confirm(`Are you sure you want to delete "${workspaceName}"? This will delete all documents and chat history. This action cannot be undone.`)) {
      return;
    }

    setDeletingId(workspaceId);
    
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted successfully');
      setWorkspaces(workspaces.filter(w => w.id !== workspaceId));
    } catch (error) {
      toast.error('Failed to delete workspace');
      console.error('Error deleting workspace:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-indigo-600" size={64} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
            Your Workspaces
          </h1>
          <p className="text-slate-600 text-lg">
            Organize your study materials by subject or project
          </p>
        </motion.div>

        {/* Create New Workspace Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowCreateModal(true)}
          className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Workspace
        </motion.button>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FolderOpen className="mx-auto mb-4 text-slate-400" size={96} />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              No workspaces yet
            </h2>
            <p className="text-slate-500">
              Create your first workspace to get started!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {workspaces.map((workspace, index) => (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderOpen className="text-indigo-600" size={24} />
                    </div>
                    
                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteWorkspace(e, workspace.id, workspace.name)}
                      disabled={deletingId === workspace.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete workspace"
                    >
                      {deletingId === workspace.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Trash2 size={18} />
                        </motion.div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </motion.button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {workspace.name}
                  </h3>
                  
                  {workspace.deadline && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <Calendar size={14} />
                      <span>Due {new Date(workspace.deadline).toLocaleDateString()}</span>
                    </div>
                  )}

                  {workspace.created_by && (
                    <div className="text-xs text-slate-500">
                      Created {new Date(workspace.created_by).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Create New Workspace
              </h2>
              
              <form onSubmit={handleCreateWorkspace} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="e.g., Data Structures, Chemistry Finals"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={newWorkspace.deadline}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Create
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}