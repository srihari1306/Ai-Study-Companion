import { useState } from 'react'
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react'
import { documentAPI } from '../../api/client'

export default function DocumentList({ workspaceId, documents, onUpload, onDelete }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      setError('Only PDF and DOCX files are supported')
      return
    }

    setError('')
    setUploading(true)

    try {
      await documentAPI.upload(workspaceId, file)
      onUpload()
      e.target.value = ''
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-gray-600">Upload and manage your study materials</p>
      </div>

      <div className="card mb-6">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-sm font-medium text-gray-700 mb-1">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-500">PDF or DOCX files (max 10MB)</span>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        
        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="text-sm font-medium">Processing document...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="card flex items-center justify-between group animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                  <p className="text-sm text-gray-500">{doc.chunk_count} chunks processed</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(doc.id)}
                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                title="Delete document"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}