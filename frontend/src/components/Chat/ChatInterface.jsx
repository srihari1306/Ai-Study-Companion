import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../../api/client'
import { Send, Bot, User } from 'lucide-react'

export default function ChatInterface({ workspaceId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [workspaceId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadHistory = async () => {
    try {
      const response = await chatAPI.getHistory(workspaceId)
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, {
      user_message: userMessage,
      ai_response: '...',
      timestamp: new Date().toISOString()
    }])

    try {
      const response = await chatAPI.sendMessage(workspaceId, userMessage)
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          user_message: userMessage,
          ai_response: response.data.answer,
          timestamp: response.data.timestamp
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          user_message: userMessage,
          ai_response: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Chat</h2>
        <p className="text-gray-600">Ask questions about your study materials</p>
      </div>

      <div className="card flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin pr-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Start a conversation! Ask me anything about your documents.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
                    <User className="w-5 h-5 text-primary-700" />
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4 flex-1">
                    <p className="text-gray-900">{msg.user_message}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                    <Bot className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{msg.ai_response}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary px-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}