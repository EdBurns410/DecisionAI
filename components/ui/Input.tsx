
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, name, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        {...props}
      />
    </div>
  );
};

export default Input;
