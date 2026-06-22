import Modal from './Modal'
import Button from './Button'

export default function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = 'تأیید', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="form">
        <p className="confirm-msg">{message}</p>
        <div className="form-actions">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}
