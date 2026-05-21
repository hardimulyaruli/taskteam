import api from './api'

export function fetchTasks() {
  return api.get('/tasks')
}

export function createTask(data) {
  return api.post('/tasks', data)
}

export function updateTask(id, data) {
  return api.put(`/tasks/${id}`, data)
}

export function updateTaskStatus(id, status) {
  return api.patch(`/tasks/${id}/status`, { status })
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`)
}
