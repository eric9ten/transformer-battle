import React from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

import s from "./modal.module.scss";

export interface ModalProps {
    title: string;
    isOpen: boolean;
    faction: string;
    onClose: () => void;    
    children: React.ReactNode;
}

export function  Modal({ isOpen, onClose, children, title, faction }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={s.modal}>
      <div className={s.modal_container}>
        <div className={s.modal_heading}>
          <h2 className={s.modal_title}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className={s.modal_closeBtn}
          >
            <Cross1Icon className="inline-block" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};