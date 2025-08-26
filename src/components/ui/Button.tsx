interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Get button styles based on variant and size
const getButtonStyles = (
  variant: 'primary' | 'secondary' | 'danger' = 'primary',
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
      : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles}`.trim();
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled);
  const combinedClassName = className ? `${buttonStyles} ${className}` : buttonStyles;

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}