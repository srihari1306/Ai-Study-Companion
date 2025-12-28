import { useState, useEffect } from 'react'
import { studyPlanAPI } from '../../api/client'
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

export default function StudyPlanView({ workspaceId, workspace }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPlan()
  }, [workspaceId])

  const loadPlan = async (regenerate = false) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await studyPlanAPI.get(workspaceId, regenerate)
      setPlan(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load study plan')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await loadPlan(true)
    setRegenerating(false)
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
        <div className="card">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Unable to Generate Study Plan</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = workspace?.deadline 
    ? differenceInDays(new Date(workspace.deadline), new Date())
    : null

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Study Plan</h2>
          <p className="text-gray-600">AI-generated personalized study schedule</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn-secondary flex items-center gap-2"
        >
          {regenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Regenerate
            </>
          )}
        </button>
      </div>

      {workspace?.deadline && (
        <div className="card mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary-700" />
            <div>
              <p className="text-sm text-primary-900 font-medium">
                Deadline: {format(new Date(workspace.deadline), 'MMMM dd, yyyy')}
              </p>
              <p className="text-sm text-primary-700">
                {daysLeft !== null && (
                  daysLeft < 0 
                    ? `Overdue by ${Math.abs(daysLeft)} days`
                    : `${daysLeft} days remaining`
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {plan?.cached && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg mb-4 text-sm">
            This is a cached plan. Click "Regenerate" for an updated version.
          </div>
        )}
        
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {plan?.plan}
          </div>
        </div>
      </div>
    </div>
  )
}