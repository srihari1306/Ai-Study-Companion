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
          <Sparkles className="text-purple-600" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl -m-8 mb-0">
        <div className="flex items-center gap-3">
          <Bot className="text-white" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Study Assistant</h2>
            <p className="text-purple-200 text-sm">Ask me anything about your study materials!</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Sparkles className="mx-auto mb-4 text-yellow-500" size={64} />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Ready to help you study!
            </h3>
            <p className="text-gray-500">
              Upload some documents first, then ask me any questions about your materials.
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
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-green-400 to-teal-500'
                }`}>
                  {msg.type === 'user' ? (
                    <User className="text-white" size={20} />
                  ) : (
                    <Bot className="text-white" size={20} />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-none'
                      : 'bg-white shadow-lg border-2 border-purple-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500">
                <Bot className="text-white" size={20} />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-purple-100 rounded-tl-none">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-purple-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-3 h-3 bg-pink-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 -m-8 mt-0 rounded-b-3xl">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your study materials..."
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-lg resize-none"
            rows="2"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <Send size={24} />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}