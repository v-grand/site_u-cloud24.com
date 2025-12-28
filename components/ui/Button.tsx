
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-2.5 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-4 transition-all duration-300 ease-in-out transform active:scale-95";
  
  const variantClasses = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400/50 shadow-orange-500/30",
    secondary: "bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400/50 shadow-cyan-500/30",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
