import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getDashboardOverview } from '../services/dashboard'
import * as taskApi from '../services/task'
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
      setUsers(response.data?.users ?? [])
      setActivities(response.data?.activities ?? [])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const refreshTasks = useCallback(async () => {
    if (!token) {
      setTasks([])
      return
    }

    try {
      const response = await taskApi.fetchTasks()
      setTasks(response.data?.tasks ?? [])
    } catch (err) {
      console.error('Gagal memuat tugas:', err?.response?.status, err?.response?.data || err.message)
      setTasks([])
    }
  }, [token])

  useEffect(() => {
    refreshDashboardData()
    refreshTasks()
  }, [refreshDashboardData, refreshTasks])

  const addTask = useCallback(async (formData) => {
    try {
      await taskApi.createTask(formData)
      await refreshTasks()
    } catch (err) {
      console.error('Gagal menambah tugas:', err)
      throw err
    }
  }, [refreshTasks])

  const updateTask = useCallback(async (id, data) => {
    if (data.status && Object.keys(data).length === 1) {
      try {
        await taskApi.updateTaskStatus(id, data.status)
        await refreshTasks()
      } catch (err) {
        console.error('Gagal mengubah status tugas:', err)
        throw err
      }
      return
    }

    try {
      await taskApi.updateTask(id, data)
      await refreshTasks()
    } catch (err) {
      console.error('Gagal mengubah tugas:', err)
      throw err
    }
  }, [refreshTasks])

  const deleteTask = useCallback(async (id) => {
    try {
      await taskApi.deleteTask(id)
      await refreshTasks()
    } catch (err) {
      console.error('Gagal menghapus tugas:', err)
      throw err
    }
  }, [refreshTasks])

  const value = useMemo(
    () => ({
      tasks,
      users,
      activities,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      refreshDashboardData,
      refreshTasks,
    }),
    [tasks, users, activities, isLoading, addTask, updateTask, deleteTask, refreshDashboardData, refreshTasks],
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