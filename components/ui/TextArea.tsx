
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, name, ...props }) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        className="block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        {...props}
      />
    </div>
  );
};

export default TextArea;
