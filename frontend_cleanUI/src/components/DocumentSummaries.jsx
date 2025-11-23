import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader, BookOpen, Lightbulb, Target, AlertCircle, ChevronDown, Download } from 'lucide-react';
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
          <Sparkles className="text-indigo-600" size={64} />
        </motion.div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800 mb-2">
            Generating AI Summaries...
          </p>
          <p className="text-slate-600">
            This may take 30-60 seconds
          </p>
        </div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-20">
        <FileText className="mx-auto mb-4 text-slate-400" size={96} />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          No Documents Yet
        </h2>
        <p className="text-slate-600">
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Document Summaries
          </h2>
          <p className="text-slate-600">
            AI-generated summaries for {documentCount} {documentCount === 1 ? 'document' : 'documents'}
          </p>
        </div>

        {summaries.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadAllSummaries}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Download size={18} />
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
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Document Header */}
                <div
                  onClick={() => !hasError && toggleExpand(summary.document_id)}
                  className={`p-6 ${!hasError ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <FileText className="text-indigo-600" size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                          {summary.filename}
                        </h3>
                        
                        {hasError ? (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                            <p className="text-rose-700 text-sm flex items-center gap-2">
                              <AlertCircle size={16} />
                              {summary.error}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
                          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download size={18} />
                        </motion.button>
                        
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-slate-600"
                        >
                          <ChevronDown size={20} />
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
                      className="border-t border-slate-200"
                    >
                      {/* Topics */}
                      {summary.topics && summary.topics.length > 0 && (
                        <div className="p-6 bg-slate-50 border-b border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <Target size={18} />
                            Main Topics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {summary.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="bg-white px-3 py-1.5 rounded-full text-sm font-medium text-indigo-700 border border-indigo-200"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Points */}
                      {summary.key_points && summary.key_points.length > 0 && (
                        <div className="p-6 bg-amber-50 border-b border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <Lightbulb size={18} />
                            Key Takeaways
                          </h4>
                          <ul className="space-y-2">
                            {summary.key_points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-amber-600 font-bold mt-0.5">•</span>
                                <span className="text-slate-800">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Full Summary */}
                      <div className="p-6">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                          <Sparkles size={18} className="text-indigo-600" />
                          Detailed Summary
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
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
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-sm">About AI Summaries</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Generated using advanced AI (Llama 3.1)</li>
              <li>• Includes main topics, key points, and detailed breakdowns</li>
              <li>• Structured with subheadings for easy navigation</li>
              <li>• Download as Markdown files for offline reference</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}