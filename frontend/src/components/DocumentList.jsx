import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Download, Clock, Layers, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function DocumentList({ workspaceId, onDocumentDeleted }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [workspaceId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/documents`);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    if (!confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(docId);
    
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter(doc => doc.id !== docId));
      
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (extension === 'pdf') {
      return '📕';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📘';
    }
    return '📄';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FileText className="text-purple-600" size={48} />
        </motion.div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FileText className="mx-auto mb-4 text-gray-400" size={96} />
          <h2 className="text-3xl font-bold text-gray-700 mb-2">
            No documents yet
          </h2>
          <p className="text-gray-500 text-lg mb-6">
            Upload some documents to get started with your AI study assistant!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'upload' }))}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Upload Your First Document
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            📚 Your Documents
          </h2>
          <p className="text-gray-600">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all"
            >
              {/* Document Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">
                  {getFileIcon(doc.filename)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                    {doc.filename}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>
              </div>

              {/* Document Stats */}
              <div className="bg-white rounded-xl p-4 mb-4 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700">
                  <Layers size={18} />
                  <span className="font-semibold">
                    {doc.chunk_count} chunks embedded
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ready for semantic search and AI chat
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  disabled={deletingId === doc.id}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === doc.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Trash2 size={18} />
                      </motion.div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="text-blue-600" size={20} />
          About Your Documents
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Each document is split into semantic chunks for better retrieval</li>
          <li>Chunks are embedded using AI and stored in the vector database</li>
          <li>Deleting a document removes all its chunks from the chat context</li>
          <li>Upload multiple documents to create a comprehensive knowledge base</li>
        </ul>
      </motion.div>
    </div>
  );
}