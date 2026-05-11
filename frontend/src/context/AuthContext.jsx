import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { loginRequest } from '../services/auth'

const AUTH_STORAGE_KEY = 'taskteam-auth'
const AuthContext = createContext(null)

function getInitialAuth() {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawValue) {
    return { user: null, token: null }
  }

  try {
    const parsed = JSON.parse(rawValue)
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
    }
  } catch {
    return { user: null, token: null }
  }
}

export function AuthProvider({ children }) {
  const [{ user, token }, setAuthState] = useState(getInitialAuth)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common.Authorization
    }
  }, [token])

  const setAuth = useCallback((nextUser, nextToken) => {
    setAuthState({ user: nextUser, token: nextToken })

    if (nextToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
      return
    }

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

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, login, logout],
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
