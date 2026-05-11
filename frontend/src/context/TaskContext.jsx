import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDashboardOverview } from '../services/dashboard'
import { useAuth } from './AuthContext'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
  const { token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshDashboardData = useCallback(async () => {
    if (!token) {
      setTasks([])
      setUsers([])
      setActivities([])
      return
    }

    setIsLoading(true)
    try {
      const response = await getDashboardOverview()
      setTasks(response.data?.tasks ?? [])
      setUsers(response.data?.users ?? [])
      setActivities(response.data?.activities ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    refreshDashboardData()
  }, [refreshDashboardData])

  const value = useMemo(
    () => ({
      tasks,
      users,
      activities,
      isLoading,
      refreshDashboardData,
    }),
    [tasks, users, activities, isLoading, refreshDashboardData],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks harus dipakai di dalam TaskProvider.')
  }

  return context
}
