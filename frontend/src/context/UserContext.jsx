import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchUsers, createUserRequest, updateUserRequest, deleteUserRequest } from '../services/users';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchUsers();
      setUsers(response.data?.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memuat daftar user.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (newUser) => {
    const response = await createUserRequest(newUser);
    setUsers(prev => [...prev, response.data.user]);
    return response.data.user;
  };

  const updateUser = async (id, updatedData) => {
    const response = await updateUserRequest(id, updatedData);
    setUsers(prev => prev.map(u => u.id === id ? response.data.user : u));
    return response.data.user;
  };

  const deleteUser = async (id) => {
    await deleteUserRequest(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <UserContext.Provider value={{ users, isLoading, error, addUser, updateUser, deleteUser, refreshUsers: loadUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);