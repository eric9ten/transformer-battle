import React from "react";
import s from './button.module.scss';

interface ButtonProps {
  label: string;
  isDisabled?: boolean;
  onClick?: () => void;
}

export function Button({label, isDisabled, onClick, ...props }: ButtonProps) {
  return (
    <button 
      type="button" 
      className={`${s.standardButton} px-4 py-2 text-stone-50 font-bold uppercase rounded-lg border border-red-900`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
}