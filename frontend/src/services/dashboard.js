import api from './api'

export function getDashboardOverview() {
  return api.get('/dashboard/overview')
}
