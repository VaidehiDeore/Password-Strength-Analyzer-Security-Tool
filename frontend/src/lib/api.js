const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || `Request failed: ${response.status}`)
  }
  return response.json()
}

export const analyze = (password, context = {}) => request('/api/analyze', { method: 'POST', body: JSON.stringify({ password, context, persist: false }) })
export const saveAnalysis = (password, context = {}) => request('/api/analyze', { method: 'POST', body: JSON.stringify({ password, context, persist: true }) })
export const generate = (payload) => request('/api/generate-password', { method: 'POST', body: JSON.stringify(payload) })
export const dashboardStats = () => request('/api/dashboard/stats')
export const weaknessStats = () => request('/api/analytics/weaknesses')
