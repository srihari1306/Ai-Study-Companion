import { useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, CreditCard, Calendar, BookOpen, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export default function Sidebar({ workspace, activeTab, onTabChange, documentCount }) {
  const navigate = useNavigate()

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText, badge: documentCount },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'summaries', label: 'Summaries', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
    { id: 'study-plan', label: 'Study Plan', icon: Calendar },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] fixed left-0 top-16">
      <div className="p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{workspace?.name}</h2>
          {workspace?.deadline && (
            <p className="text-sm text-gray-600">
              Due: {format(new Date(workspace.deadline), 'MMM dd, yyyy')}
            </p>
          )}
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}