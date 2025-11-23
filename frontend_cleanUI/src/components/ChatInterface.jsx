import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ChatInterface({ workspaceId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/chat/history`);
      const history = response.data.flatMap(m => [
        { type: 'user', text: m.user_message, timestamp: m.timestamp },
        { type: 'ai', text: m.ai_response, timestamp: m.timestamp }
      ]);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post(
        `/workspaces/${workspaceId}/chat`,
        { message: input }
      );
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: response.data.answer,
        timestamp: response.data.timestamp 
      }]);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to get response');
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: '❌ Oops! Something went wrong. Please make sure you have uploaded some documents first, and try again!' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="text-indigo-600" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
          <Bot className="text-indigo-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">AI Study Assistant</h2>
          <p className="text-sm text-slate-600">Ask questions about your materials</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="mx-auto mb-4 text-indigo-500" size={64} />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Ready to help you study!
            </h3>
            <p className="text-slate-600">
              Upload documents first, then ask any questions about your materials.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  {msg.type === 'user' ? (
                    <User className="text-white" size={16} />
                  ) : (
                    <Bot className="text-white" size={16} />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything about your study materials..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none transition-all"
          rows="2"
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          <Send size={20} />
        </motion.button>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}