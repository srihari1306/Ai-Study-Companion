import { Calendar, Trash2, FolderOpen } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

export default function WorkspaceCard({ workspace, onClick, onDelete }) {
  const daysLeft = workspace.deadline 
    ? differenceInDays(new Date(workspace.deadline), new Date())
    : null

  const getDaysLeftColor = (days) => {
    if (days < 0) return 'text-red-600'
    if (days <= 7) return 'text-orange-600'
    return 'text-green-600'
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(workspace.id)
  }

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer group animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
            <FolderOpen className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
              {workspace.name}
            </h3>
            <p className="text-sm text-gray-500">
              Created {format(new Date(workspace.created_by), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          title="Delete workspace"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {workspace.deadline && (
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            Deadline: {format(new Date(workspace.deadline), 'MMM dd, yyyy')}
          </span>
          {daysLeft !== null && (
            <span className={`ml-auto font-medium ${getDaysLeftColor(daysLeft)}`}>
              {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft} days left`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}