'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function PortalModal({ children, isOpen, onClose }: PortalModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative z-[100000] w-full flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
