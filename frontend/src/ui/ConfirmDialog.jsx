import { useState } from 'react';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  requireCheck = false,
  checkLabel = "Je comprends que cette action est irréversible",
  loading = false,
}) {
  const [checked, setChecked] = useState(false);

  const handleClose = () => {
    setChecked(false);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    setChecked(false);
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      {message && <p className="text-sm text-slate-300">{message}</p>}

      {requireCheck && (
        <label className="flex items-start gap-3 mt-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#151525] text-purple-500 focus:ring-purple-500/30"
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300">{checkLabel}</span>
        </label>
      )}

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>{cancelLabel}</Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={requireCheck && !checked}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
