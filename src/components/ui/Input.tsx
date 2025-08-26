import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'small';
  error?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

// Base input styles
const getInputStyles = (variant: 'default' | 'small' = 'default', error?: boolean) => {
  const baseStyles = 'border border-gray-300 rounded-sm focus:ring-2 focus:ring-brand-500 focus:outline-none';
  const sizeStyles = variant === 'small' ? 'px-3 py-1 text-sm' : 'px-3 py-2';
  const widthStyles = 'w-full';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';
  
  return `${baseStyles} ${sizeStyles} ${widthStyles} ${errorStyles}`.trim();
};

// Input component
export function Input({ variant = 'default', error, className, ...props }: InputProps) {
  const inputStyles = getInputStyles(variant, error);
  const combinedClassName = className ? `${inputStyles} ${className}` : inputStyles;
  
  return <input className={combinedClassName} {...props} />;
}

// Textarea component
export function Textarea({ error, className, ...props }: TextareaProps) {
  const textareaStyles = getInputStyles('default', error);
  const combinedClassName = className ? `${textareaStyles} ${className}` : textareaStyles;
  
  return <textarea className={combinedClassName} {...props} />;
}

// Label component with required indicator
export function Label({ required, children, className, ...props }: LabelProps) {
  const labelStyles = 'block font-bold mb-1';
  const combinedClassName = className ? `${labelStyles} ${className}` : labelStyles;
  
  return (
    <label className={combinedClassName} {...props}>
      {children}
      {required && (
        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md">
          Required
        </span>
      )}
    </label>
  );
}

// Form field wrapper component
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <Label required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}