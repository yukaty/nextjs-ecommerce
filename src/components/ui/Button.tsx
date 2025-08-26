import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

// Get button styles based on variant and size
const getButtonStyles = (
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  fullWidth: boolean = false,
  disabled: boolean = false
) => {
  // Base styles
  const baseStyles = 'font-semibold rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  // Variant styles
  const variantStyles = {
    primary: disabled 
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500',
    secondary: disabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-500',
    danger: disabled
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    ghost: disabled
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-brand-600 hover:bg-brand-50 focus:ring-brand-500'
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles}`.trim();
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  loading = false, 
  disabled = false,
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled || loading);
  const combinedClassName = className ? `${buttonStyles} ${className}` : buttonStyles;
  
  return (
    <button 
      className={combinedClassName} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}