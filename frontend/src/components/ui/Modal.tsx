import React, { useEffect } from 'react';
import { IcX } from './icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}

/** Dostępny modal / bottom-sheet (mobile). Zamyka Esc + klik w tło. */
const Modal: React.FC<ModalProps> = ({ open, onClose, children, labelledBy }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-x btn-icon btn-ghost" aria-label="Zamknij" onClick={onClose}>
          <IcX size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
