import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workspaceAPI, documentAPI } from '../api/client'
import Navbar from '../components/Layout/Navbar'
import Sidebar from '../components/Layout/Sidebar'
import DocumentList from '../components/Documents/DocumentList'
import ChatInterface from '../components/Chat/ChatInterface'
import FlashcardDeck from '../components/Flashcards/FlashcardDeck'
import StudyPlanView from '../components/StudyPlan/StudyPlanView'
import SummaryView from '../components/Summary/SummaryView'

export default function WorkspaceDetail() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState('documents')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkspaceData()
  }, [workspaceId])

  const loadWorkspaceData = async () => {
    try {
      const [workspacesRes, docsRes] = await Promise.all([
        workspaceAPI.getAll(),
        documentAPI.getAll(workspaceId)
      ])
      
      const currentWorkspace = workspacesRes.data.find(w => w.id === parseInt(workspaceId))
      if (!currentWorkspace) {
        navigate('/dashboard')
        return
      }
      
      setWorkspace(currentWorkspace)
      setDocuments(docsRes.data)
    } catch (error) {
      console.error('Failed to load workspace:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = () => {
    loadWorkspaceData()
  }

  const handleDocumentDelete = async (documentId) => {
    if (window.confirm('Delete this document?')) {
      try {
        await documentAPI.delete(documentId)
        loadWorkspaceData()
      } catch (error) {
        alert('Failed to delete document')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'documents':
        return (
          <DocumentList
            workspaceId={workspaceId}
            documents={documents}
            onUpload={handleDocumentUpload}
            onDelete={handleDocumentDelete}
          />
        )
      case 'chat':
        return <ChatInterface workspaceId={workspaceId} />
      case 'flashcards':
        return <FlashcardDeck workspaceId={workspaceId} />
      case 'study-plan':
        return <StudyPlanView workspaceId={workspaceId} workspace={workspace} />
      case 'summaries':
        return <SummaryView workspaceId={workspaceId} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar
          workspace={workspace}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          documentCount={documents.length}
        />
        <main className="flex-1 p-6 ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}