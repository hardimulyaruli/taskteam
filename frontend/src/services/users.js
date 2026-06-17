import api from './api'

export function fetchUsers() {
  return api.get('/admin/users')
}

export function createUserRequest(payload) {
  return api.post('/admin/users', payload)
}

export function updateUserRequest(id, payload) {
  return api.put(`/admin/users/${id}`, payload)
}

export function deleteUserRequest(id) {
  return api.delete(`/admin/users/${id}`)
}