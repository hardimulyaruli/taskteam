import React from 'react';

const Input = ({ label, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        {...props}
      />
    </div>
  );
};

export default Input;
