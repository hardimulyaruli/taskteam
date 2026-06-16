import api from './api'

// Ambil semua komentar pada sebuah task
export function fetchComments(taskId) {
  return api.get(`/tasks/${taskId}/comments`)
}

// Tambah komentar baru
export function addComment(taskId, content) {
  return api.post(`/tasks/${taskId}/comments`, { content })
}

// Hapus komentar
export function deleteComment(taskId, commentId) {
  return api.delete(`/tasks/${taskId}/comments/${commentId}`)
}