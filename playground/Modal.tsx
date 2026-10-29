import React, { useId, useRef } from "react";
import { useFocusTrap } from "./useFocusTrap";

export interface ModalProps {
  /**
   * Controls whether the modal is visible.
   */
  isOpen: boolean;
  /**
   * Invoked when the user triggers close (Escape key, close button, or backdrop click).
   */
  onClose: () => void;
  /**
   * The dialog title (used for visual heading and aria-labelledby).
   */
  title: React.ReactNode;
  /**
   * Optional description text or node (linked via aria-describedby).
   */
  description?: React.ReactNode;
  /**
   * Modal body / main content.
   */
  children: React.ReactNode;
  /**
   * Dialog role. Defaults to 'dialog', can be set to 'alertdialog' for confirmation prompts.
   */
  role?: "dialog" | "alertdialog";
  /**
   * Optional ref to element inside modal that should receive initial focus.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether clicking the backdrop overlay calls onClose. Default true.
   */
  closeOnBackdropClick?: boolean;
  /**
   * Optional custom class for dialog container.
   */
  className?: string;
}

/**
 * Accessible Modal Dialog built purely from scratch with React + TypeScript.
 * Conforms to the W3C WAI-ARIA Dialog (Modal) Pattern:
 * - role="dialog" or "alertdialog"
 * - aria-modal="true"
 * - aria-labelledby pointing to title ID
 * - aria-describedby pointing to description ID
 * - Full focus trapping (Tab / Shift+Tab looping)
 * - Restores focus to opening trigger upon dismissal
 * - Dismissable via Escape key
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  role = "dialog",
  initialFocusRef,
  closeOnBackdropClick = true,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Active focus trapping & focus restoration hook
  useFocusTrap(dialogRef, {
    isActive: isOpen,
    onClose,
    initialFocusRef,
    closeOnEscape: true,
    lockScroll: true,
  });

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click originated on the backdrop itself, not inside the dialog
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-6 focus:outline-none transition-all scale-100 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-900 tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-sm text-slate-500 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="ml-4 rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 text-slate-700">{children}</div>
      </div>
    </div>
  );
}
