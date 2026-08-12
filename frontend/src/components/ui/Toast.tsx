import React, { createContext, useContext, useState, useCallback } from 'react';
import { IcCheckCircle, IcX, IcBell } from './icons';

type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; msg: string; }

interface ToastApi { push: (msg: string, kind?: ToastKind) => void; }
const ToastCtx = createContext<ToastApi | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-wrap" role="region" aria-label="Powiadomienia">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role="status">
            <span className="toast-ic">
              {t.kind === 'success' ? <IcCheckCircle size={18} /> : t.kind === 'error' ? <IcX size={18} /> : <IcBell size={18} />}
            </span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close" aria-label="Zamknij" onClick={() => remove(t.id)}><IcX size={15} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
