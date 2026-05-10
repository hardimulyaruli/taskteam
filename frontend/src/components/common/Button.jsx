import React from 'react';

const Button = ({ children, isLoading, className = '', ...props }) => {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
