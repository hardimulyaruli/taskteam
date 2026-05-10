import React from 'react';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

const LoginBranding = () => {
  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900/40 to-[#0F172A] p-12 flex-col justify-center relative overflow-hidden">
      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FiZap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">TaskTeam</h1>
        </div>

        <h2 className="text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
          Kelola Tim.<br />
          Selesaikan<br />
          Lebih Banyak.
        </h2>
        
        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
          Platform manajemen tugas & kolaborasi tim berbasis web untuk produktivitas maksimal.
        </p>

        <ul className="space-y-4">
          {[
            'Delegasi tugas real-time',
            'Pantau deadline & progres',
            'Role-based access control',
            'REST API terintegrasi'
          ].map((item, i) => (
            <motion.li 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              key={i} 
              className="flex items-center gap-3 text-slate-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
      
      <div className="absolute bottom-12 left-12 text-sm text-slate-500">
        © 2026 TaskTeam — Kelompok 3 UNJANI
      </div>
    </div>
  );
};

export default LoginBranding;
