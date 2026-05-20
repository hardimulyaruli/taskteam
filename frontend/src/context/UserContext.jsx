import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const UserContext = createContext();

const initialUsers = [
  { id: 1, name: 'Admin Utama', username: 'admin', role: 'admin', status: 'Aktif' },
  { id: 2, name: 'Manager', username: 'manager', role: 'manager', status: 'Aktif' },
  { id: 3, name: 'Anggota Tim 1', username: 'team', role: 'team', status: 'Aktif' },
  { id: 4, name: 'Anggota Tim 2', username: 'hanif', role: 'team', status: 'Nonaktif' },
  { id: 5, name: 'Anggota Tim 3', username: 'veliana', role: 'team', status: 'Aktif' },
];

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useLocalStorage('taskteam_users', initialUsers);

  const addUser = (newUser) => {
    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { ...newUser, id }]);
  };

  const updateUser = (id, updatedData) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => useContext(UserContext);
