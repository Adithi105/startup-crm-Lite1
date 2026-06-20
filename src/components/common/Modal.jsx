import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, icon, children, footer }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock scrolling on body and prevent layout shifts on window/body
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const windowScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (windowScrollbarWidth > 0) {
      document.body.style.paddingRight = `${windowScrollbarWidth}px`;
    }

    // 2. Lock scrolling on the main content area (which actually handles dashboard scrolls)
    // and compensate for layout shift by adding padding
    const mainElement = document.querySelector("main");
    let originalMainOverflow = "";
    let originalMainPaddingRight = "";

    if (mainElement) {
      originalMainOverflow = mainElement.style.overflow;
      originalMainPaddingRight = mainElement.style.paddingRight;
      const mainScrollbarWidth = mainElement.offsetWidth - mainElement.clientWidth;
      if (mainScrollbarWidth > 0) {
        mainElement.style.paddingRight = `${mainScrollbarWidth}px`;
      }
      mainElement.style.overflow = "hidden";
    }

    // 3. Escape key closes the modal
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Restore body styles
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;

      // Restore main styles
      if (mainElement) {
        mainElement.style.overflow = originalMainOverflow;
        mainElement.style.paddingRight = originalMainPaddingRight;
      }

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Close when clicking outside of the modal window (on the overlay)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-gray-950 dark:text-white flex items-center gap-2">
            {icon && <span className="shrink-0 flex items-center">{icon}</span>}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-55/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
