import { useRef } from 'react';
import Modal from './Modal';
import { ButtonSpinner } from './LoadingSpinner';

// Confirmation for destructive actions. Focus starts on Cancel so Enter never destroys by accident.
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, children, confirmLabel = 'Confirm', busy = false }) => {
  const cancelRef = useRef(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" initialFocus={cancelRef}>
      {children && <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>}
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button ref={cancelRef} type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn-danger">
          {busy && <ButtonSpinner />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
