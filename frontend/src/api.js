
const API_BASE_URL = 'http://127.0.0.1:8000/api'

async function apiRequest(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

export const getHealth = () => apiRequest('/health')

export const getCustomers = (search = '', riskLevel = '') => {
  const params = new URLSearchParams()

  if (search) params.append('search', search)
  if (riskLevel) params.append('risk_level', riskLevel)

  const query = params.toString()

  return apiRequest(`/customers${query ? `?${query}` : ''}`)
}

export const getCustomerById = (customerId) =>
  apiRequest(`/customers/${encodeURIComponent(customerId)}`)

export const getPortfolio = () => apiRequest('/portfolio')

export const getWarnings = () => apiRequest('/warnings')
