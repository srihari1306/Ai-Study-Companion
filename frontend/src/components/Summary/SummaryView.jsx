import { useState, useEffect } from 'react'
import { summaryAPI } from '../../api/client'
import { BookOpen, FileText, Loader } from 'lucide-react'

export default function SummaryView({ workspaceId }) {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSummaries()
  }, [workspaceId])

  const loadSummaries = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await summaryAPI.getAllSummaries(workspaceId)
      setSummaries(response.data.summaries)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load summaries')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Summaries</h2>
        <p className="text-gray-600">AI-generated summaries of your study materials</p>
      </div>

      {summaries.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No documents to summarize</p>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <div key={summary.document_id} className="card animate-fade-in">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {summary.filename}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{summary.word_count} words</span>
                    <span>{summary.chunk_count} chunks</span>
                  </div>
                </div>
              </div>

              {summary.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  Error: {summary.error}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
                  </div>

                  {summary.key_points && summary.key_points.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {summary.key_points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.topics && summary.topics.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Topics Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {summary.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}