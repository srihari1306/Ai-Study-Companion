import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, ArrowLeft, FileText, Calendar, Brain, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ChatInterface from '../components/ChatInterface';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import StudyPlan from '../components/StudyPlan';
import FlashcardDeck from '../components/FlashcardDeck';
import DocumentSummaries from '../components/DocumentSummaries';
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
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'summaries', label: 'Summaries', icon: BookOpen },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'plan', label: 'Study Plan', icon: Calendar },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <MessageSquare className="text-indigo-600" size={64} />
          </motion.div>
          <p className="mt-4 text-slate-600 text-lg">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </motion.button>

        {/* Workspace Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
            {workspace.name}
          </h1>
          {workspace.deadline && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={18} />
              <span>Deadline: {new Date(workspace.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon size={18} />
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
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8"
        >
          {activeTab === 'chat' && <ChatInterface workspaceId={workspace.id} />}
          {activeTab === 'summaries' && (
            <DocumentSummaries 
              workspaceId={workspace.id}
              workspaceName={workspace.name}
            />
          )}
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
          {activeTab === 'flashcards' && (
            <FlashcardDeck workspaceId={workspace.id} />
          )}
        </motion.div>
      </div>
    </div>
  );
}