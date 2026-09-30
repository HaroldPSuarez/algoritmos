// src/components/ui/FormField.tsx
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import "./FormField.css";

interface FieldWrapperProps {
  label?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, children }: FieldWrapperProps) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      {children}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <FieldWrapper label={label}>
      <input className="field__control" {...props} />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label}>
      <select className="field__control" {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}