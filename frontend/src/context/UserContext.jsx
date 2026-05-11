import { createContext, useContext, useMemo } from 'react'
import { useTasks } from './TaskContext'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const { users } = useTasks()
  const value = useMemo(() => ({ users }), [users])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUsers() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUsers harus dipakai di dalam UserProvider.')
  }

  return context
}