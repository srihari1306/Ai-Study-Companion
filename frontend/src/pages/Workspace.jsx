import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, ArrowLeft, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import StudyPlan from '../components/StudyPlan';
import Navbar from '../components/Navbar';

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  const loadWorkspace = async () => {
    try {
      const response = await api.get('/workspaces');
      const currentWorkspace = response.data.find(w => w.id === parseInt(id));
      
      if (currentWorkspace) {
        setWorkspace(currentWorkspace);
      } else {
        toast.error('Workspace not found');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load workspace');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'from-blue-500 to-purple-600' },
    { id: 'upload', label: 'Upload Documents', icon: Upload, color: 'from-green-500 to-teal-600' },
    { id: 'documents', label: 'My Documents', icon: FileText, color: 'from-orange-500 to-red-600' },
    { id: 'plan', label: 'Study Plan', icon: Calendar, color: 'from-pink-500 to-rose-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <MessageSquare className="text-purple-600" size={64} />
          </motion.div>
          <p className="mt-4 text-gray-600 text-lg">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>

        {/* Workspace Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            {workspace.name}
          </h1>
          {workspace.deadline && (
            <p className="text-gray-600 text-lg">
              📅 Deadline: {new Date(workspace.deadline).toLocaleDateString()}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color}`
                    : 'bg-gray-400 opacity-60'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          {activeTab === 'chat' && <ChatInterface workspaceId={workspace.id} />}
          {activeTab === 'upload' && (
            <DocumentUpload 
              workspaceId={workspace.id} 
              onUploadComplete={loadWorkspace}
            />
          )}
          {activeTab === 'documents' && (
            <DocumentList 
              workspaceId={workspace.id} 
              onDocumentDeleted={loadWorkspace}
            />
          )}
          {activeTab === 'plan' && (
            <StudyPlan 
              workspaceId={workspace.id}
              workspaceName={workspace.name}
              deadline={workspace.deadline}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}