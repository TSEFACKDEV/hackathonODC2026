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

const VARIANT_CLASSES = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  white: "btn-white",
  danger: "btn-danger",
};
const SIZE_CLASSES = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  const classNameList = [
    "btn",
    "rounded-lg",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    fullWidth ? "w-full" : "",
    isDisabled ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      type={type}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      disabled={isDisabled}
      className={classNameList}
      aria-busy={loading ? true : undefined}
      {...(rest as any)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-3">
          <span className="animate-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
          <span>{children || "Chargement..."}</span>
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}