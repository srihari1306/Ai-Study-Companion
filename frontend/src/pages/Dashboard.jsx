import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Calendar, LogOut, Sparkles, Trash2 } from 'lucide-react';
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
    
    if (!newWorkspace.name) {
      toast.error('Please enter a workspace name');
      return;
    }

    try {
      const response = await api.post('/workspaces', newWorkspace);
      toast.success('Workspace created! 🎉');
      setWorkspaces([...workspaces, response.data]);
      setShowCreateModal(false);
      setNewWorkspace({ name: '', deadline: '' });
    } catch (error) {
      toast.error('Failed to create workspace');
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-purple-600" size={64} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            Your Workspaces 🚀
          </h1>
          <p className="text-gray-600 text-lg">
            Create a workspace for each subject or project you're studying
          </p>
        </motion.div>

        {/* Create New Workspace Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
        >
          <Plus size={24} />
          Create New Workspace
        </motion.button>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FolderOpen className="mx-auto mb-4 text-gray-400" size={96} />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">
              No workspaces yet
            </h2>
            <p className="text-gray-500">
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                  className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
                      <FolderOpen className="text-white" size={32} />
                    </div>
                    
                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteWorkspace(e, workspace.id, workspace.name)}
                      disabled={deletingId === workspace.id}
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-colors disabled:opacity-50"
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
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {workspace.name}
                  </h3>
                  
                  {workspace.deadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm">
                        Due: {new Date(workspace.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Created {new Date(workspace.created_at).toLocaleDateString()}
                  </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 w-full max-w-md"
            >
              <h2 className="text-3xl font-black text-gray-800 mb-6">
                Create New Workspace
              </h2>
              
              <form onSubmit={handleCreateWorkspace} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g., Data Structures, Chemistry Finals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={newWorkspace.deadline}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
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