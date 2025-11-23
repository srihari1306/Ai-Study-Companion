import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader, BookOpen, Lightbulb, Target, AlertCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function DocumentSummaries({ workspaceId, workspaceName }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState(new Set());
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    loadSummaries();
  }, [workspaceId]);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspaceId}/summaries`);
      setSummaries(response.data.summaries);
      setDocumentCount(response.data.document_count);
      
      // Auto-expand first document
      if (response.data.summaries.length > 0) {
        setExpandedDocs(new Set([response.data.summaries[0].document_id]));
      }
      
      toast.success('Summaries generated! 📚');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to generate summaries';
      toast.error(errorMsg);
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (docId) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedDocs(newExpanded);
  };

  const downloadSummary = (summary) => {
    const content = `# Summary: ${summary.filename}\n\n${summary.summary}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.filename}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded! 📥');
  };

  const downloadAllSummaries = () => {
    const allContent = summaries.map(s => 
      `# ${s.filename}\n\n${s.summary}\n\n${'='.repeat(80)}\n\n`
    ).join('');
    
    const blob = new Blob([allContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspaceName}-all-summaries.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('All summaries downloaded! 📥');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-purple-600" size={64} />
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-2">
            Generating AI Summaries...
          </p>
          <p className="text-gray-600">
            This may take 30-60 seconds depending on document size
          </p>
        </div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="mx-auto mb-4 text-gray-400" size={96} />
        <h2 className="text-3xl font-bold text-gray-700 mb-2">
          No Documents Yet
        </h2>
        <p className="text-gray-500 text-lg">
          Upload documents to generate AI summaries
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            📚 Document Summaries
          </h2>
          <p className="text-gray-600">
            AI-generated structured summaries for {documentCount} {documentCount === 1 ? 'document' : 'documents'}
          </p>
        </div>

        {summaries.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadAllSummaries}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Download All
          </motion.button>
        )}
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        <AnimatePresence>
          {summaries.map((summary, index) => {
            const isExpanded = expandedDocs.has(summary.document_id);
            const hasError = summary.error;

            return (
              <motion.div
                key={summary.document_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden"
              >
                {/* Document Header */}
                <div
                  onClick={() => !hasError && toggleExpand(summary.document_id)}
                  className={`p-6 ${!hasError ? 'cursor-pointer hover:bg-purple-50' : ''} transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                        <FileText className="text-white" size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {summary.filename}
                        </h3>
                        
                        {hasError ? (
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                            <p className="text-red-700 text-sm flex items-center gap-2">
                              <AlertCircle size={16} />
                              {summary.error}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <BookOpen size={14} />
                              <span>{summary.word_count} words</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText size={14} />
                              <span>{summary.chunk_count} sections</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Lightbulb size={14} />
                              <span>{summary.key_points?.length || 0} key points</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target size={14} />
                              <span>{summary.topics?.length || 0} topics</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!hasError && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSummary(summary);
                          }}
                          className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                        </motion.button>
                        
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-purple-600"
                        >
                          <ChevronDown size={24} />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && !hasError && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-purple-200"
                    >
                      {/* Topics Quick View */}
                      {summary.topics && summary.topics.length > 0 && (
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-purple-200">
                          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                            <Target size={20} />
                            Main Topics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {summary.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-purple-700 border-2 border-purple-200"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Points */}
                      {summary.key_points && summary.key_points.length > 0 && (
                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-purple-200">
                          <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                            <Lightbulb size={20} />
                            Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {summary.key_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-orange-600 font-bold mt-1">•</span>
                                <span className="text-gray-800">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Full Summary */}
                      <div className="p-6 bg-gray-50">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Sparkles size={20} className="text-purple-600" />
                          Detailed Summary
                        </h4>
                        <div className="prose max-w-none bg-white rounded-xl p-6 border-2 border-gray-200">
                          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                            {summary.summary}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
      >
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <BookOpen className="text-blue-600" size={20} />
          About AI Summaries
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Summaries are generated using advanced AI (Llama 3.1)</li>
          <li>Each summary includes main topics, key points, and detailed breakdowns</li>
          <li>Summaries are structured with subheadings for easy navigation</li>
          <li>Download summaries as Markdown files for offline reference</li>
          <li>Use summaries alongside chat and flashcards for comprehensive learning</li>
        </ul>
      </motion.div>
    </div>
  );
}