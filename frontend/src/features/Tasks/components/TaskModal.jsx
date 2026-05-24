import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const formatDateForInput = (date) => {
  if (!date) return '';

  // kalau sudah format YYYY-MM-DD
  if (typeof date === 'string' && date.length >= 10) {
    return date.slice(0, 10);
  }

  return '';
};

const TaskModal = ({ onClose, onSubmit, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: 'team',
    deadline: '',
    priority: 'Sedang',
    status: 'To Do'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee || 'team',
        deadline: formatDateForInput(task.deadline),
        priority: task.priority || 'Sedang',
        status: task.status || 'To Do'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignee: 'team',
        deadline: '',
        priority: 'Sedang',
        status: 'To Do'
      });
    }
  }, [task]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="modal-card"
      >
        <h2 className="modal-title">
          {task ? 'Edit Tugas' : 'Buat Tugas Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Judul Tugas</label>
            <input
              required
              type="text"
              className="input-field"
              value={formData.title}
              onChange={handleChange('title')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="input-field"
              rows="2"
              value={formData.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select
                className="input-field"
                value={formData.assignee}
                onChange={handleChange('assignee')}
              >
                <option value="team">Seluruh Team</option>
                <option value="hanif">Hanif</option>
                <option value="veliana">Veliana</option>
                <option value="rina">Rina</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                required
                type="date"
                className="input-field"
                value={formData.deadline}
                onChange={handleChange('deadline')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="input-field"
              value={formData.status}
              onChange={handleChange('status')}
            >
              <option value="To Do">To Do</option>
              <option value="Dikerjakan">Dikerjakan</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Prioritas</label>
            <select
              className="input-field"
              value={formData.priority}
              onChange={handleChange('priority')}
            >
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>

            <button type="submit" className="btn-primary">
              {task ? 'Simpan Perubahan' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;