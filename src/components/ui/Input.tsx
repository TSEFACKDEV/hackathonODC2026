"use client";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { MdWarning } from "react-icons/md";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  wrapperClass?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, leftIcon, rightElement, wrapperClass="", className="", ...rest }, ref) => (
    <div className={`w-full ${wrapperClass}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{leftIcon}</span>}
        <input
          ref={ref}
          className={`input ${leftIcon?"pl-10":""} ${rightElement?"pr-12":""} ${error?"input-error":""} ${className}`}
          {...rest}
        />
        {rightElement && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><MdWarning size={14}/>{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";
export default Input;