import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare } from 'react-icons/fi';

const ProgressPanel = ({ stats, percentage }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700/50"
    >
      <div className="flex items-center gap-2 mb-6 text-slate-200 font-semibold">
        <FiCheckSquare className="text-slate-400 w-5 h-5" /> Progress Tugas
      </div>
      
      <div className="space-y-4 text-sm mb-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 text-slate-300">
          <span>Selesai</span>
          <span className="font-medium">{stats.selesai}/{stats.total}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 text-slate-300">
          <span>Dikerjakan</span>
          <span className="font-medium">{stats.dikerjakan}/{stats.total}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/50 text-slate-300">
          <span>Belum Mulai</span>
          <span className="font-medium">{stats.total - stats.selesai - stats.dikerjakan}/{stats.total}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-4">
        <div className="text-5xl font-bold text-green-500 tracking-tighter mb-2">{percentage}%</div>
        <div className="text-xs text-slate-500">Completion Rate</div>
      </div>
    </motion.div>
  );
};

export default ProgressPanel;
