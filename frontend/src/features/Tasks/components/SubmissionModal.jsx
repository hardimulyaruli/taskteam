import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiFile, FiTrash2, FiDownload, FiLoader, FiArrowLeft, FiEye } from 'react-icons/fi';
import { uploadSubmissions, fetchSubmissions, deleteSubmission, downloadSubmission, previewSubmission } from '../../../services/submission';
import { useAuth } from '../../../context/AuthContext';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimetype = '') {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype === 'application/pdf') return '📄';
  if (mimetype.includes('word')) return '📝';
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📑';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return '🗜️';
  return '📎';
}

function isPreviewable(mimetype = '') {
  return mimetype.startsWith('image/') || mimetype === 'application/pdf';
}

const SubmissionModal = ({ task, onClose, userRole, onBack }) => {
  const { user } = useAuth();

  const [submissions, setSubmissions]     = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isUploading, setIsUploading]     = useState(false);
  const [isDragging, setIsDragging]       = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const fileInputRef = useRef(null);

  const isSelesai = task.status === 'Selesai';
  const today     = new Date();
  const deadline  = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && deadline < today && !isSelesai;

  const canUpload = userRole === 'team' && !isSelesai && !isOverdue;

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchSubmissions(task.id);
      setSubmissions(res.data?.submissions ?? []);
    } catch {
      setError('Gagal memuat submission.');
    } finally {
      setIsLoading(false);
    }
  }, [task.id]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const handleFiles = (files) => {
    setSelectedFiles(Array.from(files).slice(0, 5));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    setError('');
    try {
      await uploadSubmissions(task.id, selectedFiles);
      setSelectedFiles([]);
      setSuccessMsg('File berhasil diupload! ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadSubmissions();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengupload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm('Hapus file ini?')) return;
    try {
      await deleteSubmission(task.id, subId);
      await loadSubmissions();
    } catch {
      setError('Gagal menghapus file.');
    }
  };

  const handleDownload = async (sub) => {
    try {
      await downloadSubmission(sub.id, sub.originalName);
    } catch {
      setError('Gagal mendownload file.');
    }
  };

  const handlePreview = async (sub) => {
    try {
      await previewSubmission(sub.id, sub.mimetype, sub.originalName);
    } catch {
      setError('Gagal membuka preview file.');
    }
  };

  const isManagerBlocked = userRole === 'manager' && !isSelesai;

  return (
    <div className="modal-overlay" onClick={onBack || onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="modal-card"
        style={{ maxWidth: '520px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="td-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBack && (
              <button
                onClick={onBack}
                title="Kembali"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: '4px',
                  borderRadius: '6px', display: 'flex', alignItems: 'center',
                }}
              >
                <FiArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                📎 Submission Tugas
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {task.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="td-close-btn"><FiX /></button>
        </div>

        {/* UPLOAD AREA */}
        {canUpload && (
          <div style={{ marginBottom: '16px' }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                borderRadius: '10px', padding: '24px', textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'var(--bg-hover)' : 'var(--bg-card)',
                transition: 'all 0.2s',
              }}
            >
              <FiUploadCloud size={28} style={{ color: 'var(--accent-blue)', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Drag & drop file ke sini, atau{' '}
                <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>klik untuk pilih</span>
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.7 }}>
                Maks 5 file · 10 MB per file · PDF, Word, Excel, Gambar, ZIP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />

            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                >
                  {selectedFiles.map((file, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', borderRadius: '8px',
                      background: 'var(--bg-hover)', fontSize: '0.8rem',
                    }}>
                      <span>📎</span>
                      <span style={{ flex: 1, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                        {formatBytes(file.size)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, j) => j !== i)); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-red)', padding: 0 }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary"
                    style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {isUploading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <FiLoader size={14} />
                        </motion.div>
                        Mengupload...
                      </>
                    ) : (
                      <><FiUploadCloud size={14} /> Upload {selectedFiles.length} File</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p style={{ color: 'var(--status-red)', fontSize: '0.78rem', marginTop: '8px' }}>⚠️ {error}</p>}
            {successMsg && <p style={{ color: 'var(--status-green)', fontSize: '0.78rem', marginTop: '8px' }}>{successMsg}</p>}
          </div>
        )}

        {/* INFO tugas selesai */}
        {userRole === 'team' && isSelesai && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            fontSize: '0.82rem', color: 'var(--status-green)',
          }}>
            ✅ Tugas sudah diserahkan. File tidak dapat diubah.
          </div>
        )}

        {/* INFO tugas terlewat */}
        {userRole === 'team' && isOverdue && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.82rem', color: 'var(--status-red)',
          }}>
            ⚠️ Deadline sudah terlewat. Upload tidak diizinkan.
          </div>
        )}

        <div className="td-divider" />

        {/* LIST SUBMISSIONS */}
        <div>
          <p style={{
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
            marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            File Tersubmit ({isManagerBlocked ? '?' : submissions.length})
          </p>

          {isManagerBlocked ? (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Belum Diserahkan
              </p>
              <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.6 }}>
                File baru bisa dilihat setelah team menyerahkan tugas ini.
              </p>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Memuat...
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FiFile size={24} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p style={{ margin: 0 }}>Belum ada file yang disubmit.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {submissions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{getFileIcon(sub.mimetype)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: '0.82rem', fontWeight: 600,
                      color: 'var(--text-primary)', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {sub.originalName}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {sub.uploadedBy} · {sub.sizeFormatted || formatBytes(sub.size)} · {new Date(sub.uploadedAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>

                    {/* PREVIEW — gambar & PDF, semua role */}
                    {isPreviewable(sub.mimetype) && (
                      <button
                        onClick={() => handlePreview(sub)}
                        title="Lihat file"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--status-green)', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiEye size={15} />
                      </button>
                    )}

                    {/* DOWNLOAD — hanya manager */}
                    {userRole === 'manager' && (
                      <button
                        onClick={() => handleDownload(sub)}
                        title="Download"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--accent-blue)', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiDownload size={15} />
                      </button>
                    )}

                    {/* HAPUS — manager bisa hapus semua */}
                    {userRole === 'manager' && (
                      <button
                        onClick={() => handleDelete(sub.id)}
                        title="Hapus file"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--status-red)', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}

                    {/* HAPUS — team hanya file milik sendiri */}
                    {userRole === 'team' && canUpload && sub.uploadedBy === user?.username && (
                      <button
                        onClick={() => handleDelete(sub.id)}
                        title="Hapus file saya"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--status-red)', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="td-divider" style={{ marginTop: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onBack ? (
            <button
              onClick={onBack}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiArrowLeft size={14} /> Kembali
            </button>
          ) : <div />}
          <button onClick={onClose} className="btn-secondary">Tutup</button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmissionModal;