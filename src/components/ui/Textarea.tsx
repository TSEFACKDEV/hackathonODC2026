"use client";
import { TextareaHTMLAttributes, forwardRef } from "react";
import { MdWarning } from "react-icons/md";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className="", ...rest }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
    <textarea
      ref={ref}
      className={`input resize-none ${error?"input-error":""} ${className}`}
      {...rest}
    />
    {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><MdWarning size={14}/>{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
export default Textarea;