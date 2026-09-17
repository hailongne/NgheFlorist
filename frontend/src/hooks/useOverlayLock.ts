import { useEffect, useId } from 'react';
import { globalOverlayManager } from '../utils/overlayManager';

export interface UseOverlayLockOptions {
  isOpen: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  onClose?: () => void;
  overlayId?: string;
  priority?: number;
}

/**
 * Custom hook to lock background interaction and trap focus when an overlay (modal, drawer, dialog) is open.
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

  useEffect(() => {
    if (isOpen) {
      globalOverlayManager.register({
        id,
        containerEl: containerRef.current,
        onClose,
        priority
      });

      return () => {
        globalOverlayManager.unregister(id);
      };
    } else {
      globalOverlayManager.unregister(id);
    }
  }, [isOpen, id, onClose, priority, containerRef]);
}
