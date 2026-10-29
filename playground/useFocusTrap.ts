import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contentEditable=true]:not([tabindex="-1"])',
].join(",");

export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is currently active (e.g. modal isOpen).
   */
  isActive: boolean;
  /**
   * Callback invoked when the user hits Escape.
   */
  onClose?: () => void;
  /**
   * Optional ref to element that should receive initial focus.
   * If omitted, the first focusable element in the container is focused.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * Whether pressing Escape triggers onClose (default: true).
   */
  closeOnEscape?: boolean;
  /**
   * Whether to lock document.body scroll while active (default: true).
   */
  lockScroll?: boolean;
}

export function useFocusTrap<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  options: UseFocusTrapOptions
) {
  const {
    isActive,
    onClose,
    initialFocusRef,
    closeOnEscape = true,
    lockScroll = true,
  } = options;

  // Track the element that triggered the modal opening so we can return focus on close
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // 1. Capture previously focused element to return focus upon closing
    triggerElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // 2. Lock body scroll if enabled
    const originalOverflow = document.body.style.overflow;
    if (lockScroll) {
      document.body.style.overflow = "hidden";
    }

    // 3. Move initial focus
    const frameId = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // If container has no focusable elements, focus the container itself
        if (containerRef.current.getAttribute("tabindex") === null) {
          containerRef.current.setAttribute("tabindex", "-1");
        }
        containerRef.current.focus();
      }
    });

    // 4. Trap keyboard focus & handle Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key === "Tab") {
        const focusable = getFocusableElements(containerRef.current);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const currentActive = document.activeElement;

        if (event.shiftKey) {
          // Shift + Tab: if on first element, wrap to last
          if (currentActive === first || !containerRef.current.contains(currentActive)) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (currentActive === last || !containerRef.current.contains(currentActive)) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleKeyDown, true);

      if (lockScroll) {
        document.body.style.overflow = originalOverflow;
      }

      // 5. Restore focus to the trigger element that opened the dialog
      if (triggerElementRef.current && document.body.contains(triggerElementRef.current)) {
        triggerElementRef.current.focus();
      }
    };
  }, [isActive, onClose, initialFocusRef, closeOnEscape, lockScroll, containerRef]);
}

/**
 * Query all visible, non-disabled focusable elements inside a root container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  return elements.filter((el) => {
    return (
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el.getClientRects().length > 0
    );
  });
}
