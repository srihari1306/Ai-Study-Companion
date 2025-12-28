import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth APIs
export const authAPI = {
  register: (username, password) => 
    api.post('/register', { username, password }),
  login: (username, password) => 
    api.post('/login', { username, password }),
  logout: () => 
    api.post('/logout'),
  getCurrentUser: () => 
    api.get('/current_user'),
}

// Workspace APIs
export const workspaceAPI = {
  getAll: () => 
    api.get('/workspaces'),
  create: (name, deadline) => 
    api.post('/workspaces', { name, deadline }),
  delete: (workspaceId) => 
    api.delete(`/workspaces/${workspaceId}`),
}

// Document APIs
export const documentAPI = {
  upload: (workspaceId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/workspaces/${workspaceId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAll: (workspaceId) => 
    api.get(`/workspaces/${workspaceId}/documents`),
  getOne: (documentId) => 
    api.get(`/documents/${documentId}`),
  delete: (documentId) => 
    api.delete(`/documents/${documentId}`),
  getSummary: (documentId) => 
    api.get(`/documents/${documentId}/summary`),
  getQuickSummary: (documentId) => 
    api.get(`/documents/${documentId}/quick-summary`),
}

// Chat APIs
export const chatAPI = {
  sendMessage: (workspaceId, message) => 
    api.post(`/workspaces/${workspaceId}/chat`, { message }),
  getHistory: (workspaceId) => 
    api.get(`/workspaces/${workspaceId}/chat/history`),
}

// Study Plan APIs
export const studyPlanAPI = {
  get: (workspaceId, regenerate = false) => 
    api.get(`/workspaces/${workspaceId}/study-plan?regenerate=${regenerate}`),
}

// Flashcard APIs
export const flashcardAPI = {
  generate: (workspaceId, count = 10) => 
    api.post(`/workspaces/${workspaceId}/flashcards/generate`, { count }),
  getAll: (workspaceId) => 
    api.get(`/workspaces/${workspaceId}/flashcards/all`),
  getDue: (workspaceId) => 
    api.get(`/workspaces/${workspaceId}/flashcards/due`),
  review: (flashcardId, quality) => 
    api.post(`/flashcards/${flashcardId}/review`, { quality }),
  delete: (flashcardId) => 
    api.delete(`/flashcards/${flashcardId}`),
}

// Summary APIs
export const summaryAPI = {
  getAllSummaries: (workspaceId) => 
    api.get(`/workspaces/${workspaceId}/summaries`),
  getDocumentSummary: (documentId) => 
    api.get(`/documents/${documentId}/summary`),
}

export default api