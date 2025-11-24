import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            block w-full px-4 py-3 rounded-xl 
            bg-slate-800/50 border 
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-indigo-500 focus:border-indigo-500'}
            text-white placeholder-slate-400 
            focus:outline-none focus:ring-2 transition-all duration-200
            disabled:opacity-50
            ${icon ? 'pl-11' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 ml-1 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};