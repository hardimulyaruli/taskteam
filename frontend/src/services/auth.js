import api from './api'

export function loginRequest(payload) {
  return api.post('/auth/login', payload)
}

// Ambil data profile terbaru (termasuk avatar)
export function fetchMe() {
  return api.get('/auth/me')
}

// Update nama lengkap / username
export function updateProfileRequest(username) {
  return api.put('/auth/profile', { username })
}

// Update password
export function updatePasswordRequest(password) {
  return api.put('/auth/password', { password })
}

// Upload foto profil
export function uploadAvatarRequest(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  return api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Hapus foto profil
export function deleteAvatarRequest() {
  return api.delete('/auth/avatar')
}