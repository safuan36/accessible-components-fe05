import React, { useId, useState } from "react";

export interface DisclosureProps {
  /**
   * Title or label inside the disclosure trigger button.
   */
  title: React.ReactNode;
  /**
   * Content revealed when disclosure is expanded.
   */
  children: React.ReactNode;
  /**
   * Initial expanded state for uncontrolled usage. Default: false.
   */
  defaultExpanded?: boolean;
  /**
   * Controlled expanded state.
   */
  isExpanded?: boolean;
  /**
   * Callback fired when expanded state changes.
   */
  onToggle?: (isExpanded: boolean) => void;
  /**
   * Optional custom class for outer container.
   */
  className?: string;
  /**
   * Optional custom class for trigger button.
   */
  triggerClassName?: string;
  /**
   * Optional custom class for the content container.
   */
  contentClassName?: string;
  /**
   * Whether to unmount content when collapsed (true) or use hidden attribute (false). Default: false.
   */
  unmountWhenCollapsed?: boolean;
}

/**
 * Accessible Disclosure (Show/Hide / Collapsible) built purely from scratch with React + TypeScript.
 * Conforms to the W3C WAI-ARIA Disclosure Pattern:
 * - Trigger element is a native <button> with type="button"
 * - aria-expanded="true" when open, "false" when closed
 * - aria-controls pointing to the controlled region's id
 * - Controlled region has matching id and is toggled via hidden or unmounted
 * - Full native keyboard support: Enter and Space toggle state; Tab moves into content
 */
export function Disclosure({
  title,
  children,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onToggle,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  unmountWhenCollapsed = false,
}: DisclosureProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const nextState = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(nextState);
    }
    onToggle?.(nextState);
  };

  return (
    <div
      className={`border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all ${className}`}
    >
      <h3>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={handleToggle}
          className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset transition-colors ${triggerClassName}`}
        >
          <span>{title}</span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-blue-600" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </h3>

      {(!unmountWhenCollapsed || isExpanded) && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          hidden={!isExpanded}
          className={`px-4 py-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
