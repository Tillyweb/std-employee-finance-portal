import React from 'react';
import { X } from 'lucide-react';

interface ModalProps { children: React.ReactNode; onClose: () => void; title?: string; }
export function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} aria-label="ปิด" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}