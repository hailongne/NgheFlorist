import { useEffect, useId, useRef } from 'react';
import { globalOverlayManager } from '../utils/overlayManager';

export interface UseOverlayLockOptions {
  isOpen: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  onClose?: () => void;
  overlayId?: string;
  priority?: number;
  // Allow extra props from callers without TypeScript errors (e.g. id, role)
  [key: string]: any;
}

/**
 * Custom hook to lock background interaction and trap focus when an overlay (modal, drawer, dialog) is open.
 *
 * CRITICAL: `onClose` is stored in a ref to prevent the effect from re-running on every render.
 * Without this, every re-render (e.g. typing in an input) creates a new `onClose` function reference,
 * causing the overlay manager to re-register and steal focus from the active input.
 */
export function useOverlayLock({
  isOpen,
  containerRef,
  onClose,
  overlayId,
  priority = 10
}: UseOverlayLockOptions) {
  const generatedId = useId();
  const id = overlayId || generatedId;

  // Store onClose in a ref so the effect doesn't depend on it.
  // This prevents re-registration (and focus steal) on every parent re-render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Store priority in a ref too — it rarely changes and shouldn't trigger re-registration
  const priorityRef = useRef(priority);
  priorityRef.current = priority;

  useEffect(() => {
    if (isOpen) {
      globalOverlayManager.register({
        id,
        containerEl: containerRef.current,
        onClose: () => onCloseRef.current?.(),
        priority: priorityRef.current
      });

      return () => {
        globalOverlayManager.unregister(id);
      };
    } else {
      globalOverlayManager.unregister(id);
    }
    // Only re-run when the overlay actually opens/closes or the ID changes.
    // onClose and priority are accessed via refs, so they don't need to be dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, id]);
}
