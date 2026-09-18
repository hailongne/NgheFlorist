/**
 * GLOBAL OVERLAY & FOCUS LOCK MANAGER
 * 
 * Centralized manager for:
 * 1. Body Scroll Lock with Ref-counting & Scroll Position Preservation (Zero layout shift, Zero jump).
 * 2. Interaction Barrier: Blocks click-through, touch-move rubber-banding, wheel scroll chaining to background.
 * 3. Focus Trap: Traps Tab / Shift+Tab within the top-most active overlay.
 * 4. ESC Key Handler: Closes only the top-most overlay and restores focus to the trigger element.
 * 5. Nested Overlay Hierarchy: Supports multi-layered popups without conflict.
 */

export interface OverlayItem {
  id: string;
  containerEl?: HTMLElement | null;
  onClose?: () => void;
  triggerEl?: HTMLElement | null;
  priority?: number; // Higher priority stays on top
}

class OverlayManager {
  private stack: OverlayItem[] = [];
  private originalScrollY = 0;
  private scrollbarWidth = 0;
  private isLocked = false;
  private keydownListenerBound = false;
  private touchmoveListenerBound = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  /**
   * Register and activate an overlay
   */
  public register(item: OverlayItem): void {
    // Check if this overlay was already registered (re-registration / update)
    const existingIndex = this.stack.findIndex(o => o.id === item.id);
    const isReRegistration = existingIndex !== -1;

    // Remove existing entry to update
    if (isReRegistration) {
      this.stack.splice(existingIndex, 1);
    }

    // Save active element if not provided and this is a fresh registration
    if (!isReRegistration && !item.triggerEl && document.activeElement instanceof HTMLElement) {
      item.triggerEl = document.activeElement;
    }

    this.stack.push(item);

    // Sort by priority if needed
    if (item.priority !== undefined) {
      this.stack.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    // Lock body on first overlay
    if (!this.isLocked) {
      this.lockBodyScroll();
    }

    // Attach global listeners
    this.attachListeners();

    // Auto focus into the overlay container ONLY on first registration.
    // Re-registration (e.g. from useEffect re-run) must NOT steal focus
    // from an active input inside the modal.
    if (!isReRegistration) {
      this.focusInitialElement(item.containerEl);
    }
  }

  /**
   * Unregister an overlay when closed
   */
  public unregister(id: string): void {
    const itemIndex = this.stack.findIndex(o => o.id === id);
    if (itemIndex === -1) return;

    const [removedItem] = this.stack.splice(itemIndex, 1);

    // Restore focus to trigger element if provided
    if (removedItem?.triggerEl && typeof removedItem.triggerEl.focus === 'function') {
      try {
        removedItem.triggerEl.focus();
      } catch {}
    }

    // If no more overlays, unlock body
    if (this.stack.length === 0) {
      this.unlockBodyScroll();
      this.detachListeners();
    } else {
      // Focus into new top-most overlay
      const top = this.getTopOverlay();
      if (top?.containerEl) {
        this.focusInitialElement(top.containerEl);
      }
    }
  }

  /**
   * Get the top-most active overlay
   */
  public getTopOverlay(): OverlayItem | undefined {
    return this.stack[this.stack.length - 1];
  }

  /**
   * Check if a specific overlay is currently the top-most
   */
  public isTopOverlay(id: string): boolean {
    const top = this.getTopOverlay();
    return top?.id === id;
  }

  /**
   * Lock body scroll with scrollbar padding compensation and exact position preservation
   */
  private lockBodyScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Measure scrollbar width to prevent horizontal layout shift on desktop
    this.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Record exact current scroll position
    this.originalScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    const body = document.body;
    const html = document.documentElement;

    // Apply fixed positioning with negative top offset
    body.style.position = 'fixed';
    body.style.top = `-${this.originalScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    if (this.scrollbarWidth > 0) {
      body.style.paddingRight = `${this.scrollbarWidth}px`;
    }

    // Add CSS class for global control
    body.classList.add('global-overlay-locked');
    html.classList.add('global-overlay-locked');

    this.isLocked = true;
  }

  /**
   * Unlock body scroll and restore scroll position seamlessly
   */
  private unlockBodyScroll(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.paddingRight = '';

    body.classList.remove('global-overlay-locked');
    html.classList.remove('global-overlay-locked');

    this.isLocked = false;

    // Restore exact scroll position without any visual glitch
    window.scrollTo(0, this.originalScrollY);
  }

  /**
   * Attach global event listeners
   */
  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    if (!this.keydownListenerBound) {
      window.addEventListener('keydown', this.handleKeyDown, true);
      this.keydownListenerBound = true;
    }

    if (!this.touchmoveListenerBound) {
      // Non-passive to allow e.preventDefault() on touch gestures outside scrollable popup
      window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.touchmoveListenerBound = true;
    }
  }

  /**
   * Detach global event listeners
   */
  private detachListeners(): void {
    if (typeof window === 'undefined') return;

    if (this.keydownListenerBound) {
      window.removeEventListener('keydown', this.handleKeyDown, true);
      this.keydownListenerBound = false;
    }

    if (this.touchmoveListenerBound) {
      window.removeEventListener('touchmove', this.handleTouchMove);
      this.touchmoveListenerBound = false;
    }
  }

  /**
   * Global KeyDown handler for ESC and Focus Trap (Tab navigation)
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const top = this.getTopOverlay();
    if (!top) return;

    // 1. ESC Key closes only the top-most overlay
    if (e.key === 'Escape' || e.keyCode === 27) {
      e.stopPropagation();
      e.preventDefault();
      if (top.onClose) {
        top.onClose();
      }
      return;
    }

    // 2. Focus Trap on Tab key inside top-most overlay
    if (e.key === 'Tab' || e.keyCode === 9) {
      if (!top.containerEl) return;

      const focusable = this.getFocusableElements(top.containerEl);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, wrap to last
        if (document.activeElement === firstEl || !top.containerEl.contains(document.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastEl || !top.containerEl.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }

  /**
   * TouchMove interaction barrier:
   * Prevents rubber-banding and scroll chaining on mobile Safari/Chrome
   */
  private handleTouchMove(e: TouchEvent): void {
    const top = this.getTopOverlay();
    if (!top) return;

    // If no container, block all touch movements
    if (!top.containerEl) {
      e.preventDefault();
      return;
    }

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // If touch target is outside top container (e.g. on backdrop), prevent touch scrolling completely
    if (!top.containerEl.contains(target)) {
      e.preventDefault();
      return;
    }

    // Inside container: allow scrolling only if element or its parent is scrollable
    const scrollableParent = this.findScrollableParent(target, top.containerEl);
    if (!scrollableParent) {
      e.preventDefault();
    }
  }

  /**
   * Find scrollable parent within the overlay container
   */
  private findScrollableParent(el: HTMLElement, limitEl: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = el;
    while (current && current !== limitEl.parentElement) {
      if (current.scrollHeight > current.clientHeight) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return current;
        }
      }
      if (current === limitEl) break;
      current = current.parentElement;
    }
    return null;
  }

  /**
   * Find all focusable elements inside a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(el => {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });
  }

  /**
   * Focus initial element inside container
   */
  private focusInitialElement(container?: HTMLElement | null): void {
    if (!container) return;

    // Wait 1 frame for animations or rendering
    setTimeout(() => {
      // Check for autofocus element first
      const autoFocusEl = container.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
      if (autoFocusEl) {
        autoFocusEl.focus();
        return;
      }

      // Or first focusable element
      const focusable = this.getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }, 50);
  }
}

// Export singleton instance
export const globalOverlayManager = new OverlayManager();
