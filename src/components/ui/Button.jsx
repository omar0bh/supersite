// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, icon: Icon }) => {
  const base = "relative inline-flex items-center justify-center font-semibold py-4 px-8 rounded-2xl transition-all duration-300 overflow-hidden group disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,144,255,0.2)]";
  const variants = {
    primary: "bg-[var(--accent-primary)] text-white shadow-[var(--glow-primary)] hover:-translate-y-1",
    secondary: "bg-[var(--accent-secondary)] text-[var(--primary)] shadow-[0_20px_40px_rgba(63,224,197,0.4)] hover:-translate-y-1",
    magic: "bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--surface-primary)]",
    neon: "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[var(--glow-primary)] hover:-translate-y-1",
    outline: "border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.primary} ${className}`}>
      {Icon && <Icon size={18} className="mr-2 group-hover:rotate-12 transition-transform" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
