import type { ReactNode } from 'react';
import { useModalA11y } from './useModalA11y';

interface ModalShellProps {
  onClose: () => void;
  /** id of the element naming this dialog, for aria-labelledby */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

/**
 * Backdrop + dialog wrapper that carries the shared modal behaviour.
 *
 * Exists because the ARIA and the keyboard handling kept drifting apart: a
 * dialog would get role/aria-modal but not Escape and the focus trap, or the
 * reverse. Routing every modal through one shell means a new one cannot ship
 * with only half of it.
 */
export default function ModalShell({ onClose, labelledBy, className = '', children }: ModalShellProps) {
  const ref = useModalA11y<HTMLDivElement>(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        data-modal-root="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={className}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
