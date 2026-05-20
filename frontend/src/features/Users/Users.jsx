import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const Users = () => {
  const { user: activeUser } = useAuth();
  const { users, addUser, deleteUser } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', role: 'team', status: 'Aktif' });

  // Only Admin has full access, but we'll protect this route in App.jsx anyway.
  if (activeUser.role !== 'admin') {
    return <div className="p-8 text-[#f85149]">Akses Ditolak. Halaman ini khusus Administrator.</div>;
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setShowModal(false);
    setFormData({ name: '', username: '', role: 'team', status: 'Aktif' });
  };

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="pro-heading text-2xl mb-1">Manajemen User</h1>
          <p className="text-sm text-[#8b949e]">Kelola data pengguna, hak akses, dan status akun.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="pro-button-primary flex items-center gap-2">
          <FiPlus /> Tambah User
        </button>
      </div>

      <div className="pro-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0d1117] text-xs uppercase font-medium text-[#8b949e] border-b border-[#30363d]">
            <tr>
              <th className="px-5 py-3">Nama Lengkap</th>
              <th className="px-5 py-3">Username</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#21262d]/50 transition-colors">
                <td className="px-5 py-4 font-medium text-[#f0f6fc]">{u.name}</td>
                <td className="px-5 py-4 text-[#c9d1d9]">@{u.username}</td>
                <td className="px-5 py-4 capitalize text-[#8b949e]">{u.role}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${u.status === 'Aktif' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]/20' : 'bg-[#8b949e]/10 text-[#8b949e] border-[#30363d]'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => deleteUser(u.id)} disabled={u.username === 'admin'} className="text-[#8b949e] hover:text-[#f85149] p-1 transition-colors disabled:opacity-30">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="pro-card p-6 w-full max-w-md bg-[#161b22] border border-[#30363d] shadow-2xl">
            <h2 className="pro-heading text-lg mb-4">Buat User Baru</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Nama Lengkap</label>
                <input required type="text" className="pro-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Username (untuk Login)</label>
                <input required type="text" className="pro-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Role</label>
                  <select className="pro-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="team">Team</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b949e] mb-1.5">Status</label>
                  <select className="pro-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-[#30363d]">
                <button type="button" onClick={() => setShowModal(false)} className="pro-button">Batal</button>
                <button type="submit" className="pro-button-primary">Simpan User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
