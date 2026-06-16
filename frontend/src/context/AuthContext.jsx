import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { loginRequest, fetchMe, updateProfileRequest, updatePasswordRequest, uploadAvatarRequest, deleteAvatarRequest } from '../services/auth'

const AUTH_STORAGE_KEY = 'taskteam-auth'
const AuthContext = createContext(null)

function getInitialAuth() {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawValue) {
    return { user: null, token: null }
  }

  try {
    const parsed = JSON.parse(rawValue)
    const user = parsed.user ?? null
    const token = parsed.token ?? null

    // Set header synchronously so it's available before any child effects run
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    }

    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuthState] = useState(getInitialAuth)

  const setAuth = useCallback((nextUser, nextToken) => {
    setAuthState({ user: nextUser, token: nextToken })

    if (nextToken) {
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
      return
    }

    delete api.defaults.headers.common.Authorization
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (username, password) => {
      const response = await loginRequest({ username, password })
      const userPayload = response.data?.user
      const tokenPayload = response.data?.token

      if (!userPayload || !tokenPayload) {
        throw new Error('Response login tidak valid.')
      }

      setAuth(userPayload, tokenPayload)
      return userPayload
    },
    [setAuth],
  )

  const logout = useCallback(() => {
    setAuth(null, null)
  }, [setAuth])

  // ── Update nama lengkap / username ──
  const updateProfile = useCallback(
    async (username) => {
      const response = await updateProfileRequest(username)
      const updatedUser = response.data?.user

      if (updatedUser) {
        setAuth(updatedUser, token)
      }

      return updatedUser
    },
    [setAuth, token],
  )

  // ── Update password ──
  const updatePassword = useCallback(
    async (password) => {
      const response = await updatePasswordRequest(password)
      return response.data
    },
    [],
  )

  // ── Upload foto profil ──
  const uploadAvatar = useCallback(
    async (file) => {
      const response = await uploadAvatarRequest(file)
      const updatedUser = response.data?.user

      if (updatedUser) {
        setAuth(updatedUser, token)
      }

      return updatedUser
    },
    [setAuth, token],
  )

  // ── Hapus foto profil ──
  const deleteAvatar = useCallback(
    async () => {
      const response = await deleteAvatarRequest()
      const updatedUser = response.data?.user

      if (updatedUser) {
        setAuth(updatedUser, token)
      }

      return updatedUser
    },
    [setAuth, token],
  )

  // ── Refresh data user dari server (untuk sinkron avatar/username) ──
  const refreshUser = useCallback(
    async () => {
      const response = await fetchMe()
      const refreshedUser = response.data?.user

      if (refreshedUser) {
        setAuth(refreshedUser, token)
      }

      return refreshedUser
    },
    [setAuth, token],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      updateProfile,
      updatePassword,
      uploadAvatar,
      deleteAvatar,
      refreshUser,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, login, logout, updateProfile, updatePassword, uploadAvatar, deleteAvatar, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider.')
  }

  return context
}