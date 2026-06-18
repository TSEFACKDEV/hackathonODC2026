"use client";
import { motion } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"outline"|"ghost"|"white"|"danger";
  size?: "sm"|"md"|"lg";
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const V = { primary:"btn-primary", secondary:"btn-secondary", outline:"btn-outline", ghost:"btn-ghost", white:"btn-white", danger:"btn-danger" };
const S = { sm:"btn-sm", md:"btn-md", lg:"btn-lg" };

export default function Button({ children, variant="primary", size="md", loading, icon, iconRight, fullWidth, className="", disabled, ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`${S[size]} ${V[variant]} ${fullWidth?"w-full":""} ${className}`}
      {...(rest as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  );
}