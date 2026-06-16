import api from './api'

// Upload file
export function uploadSubmissions(taskId, files) {
  const formData = new FormData()
  Array.from(files).forEach((file) => {
    formData.append('files', file)
  })

  return api.post(`/tasks/${taskId}/submissions`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Ambil semua submission milik sebuah task
export function fetchSubmissions(taskId) {
  return api.get(`/tasks/${taskId}/submissions`)
}

// Download file 
export async function downloadSubmission(subId, originalName) {
  const response = await api.get(`/submissions/${subId}/download`, {
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const a   = document.createElement('a')
  a.href     = url
  a.download = originalName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

// Hapus submission
export function deleteSubmission(taskId, subId) {
  return api.delete(`/tasks/${taskId}/submissions/${subId}`)
}

// Preview file 
export async function previewSubmission(subId, mimetype, originalName) {
  const response = await api.get(`/submissions/${subId}/download`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: mimetype })
  const url  = window.URL.createObjectURL(blob)

  const previewable = mimetype?.startsWith('image/') || mimetype === 'application/pdf'

  if (previewable) {
    window.open(url, '_blank')
  } else {
    const a   = document.createElement('a')
    a.href     = url
    a.download = originalName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  setTimeout(() => window.URL.revokeObjectURL(url), 10000)
}