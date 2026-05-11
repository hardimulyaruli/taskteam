import api from './api'

export function loginRequest(payload) {
  return api.post('/auth/login', payload)
}
