export default function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div className="crm-modal-backdrop" onMouseDown={onClose}>
      <div
        className={`crm-modal ${wide ? 'crm-modal--wide' : ''}`}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="crm-modal__header">
          <h3 className="crm-modal__title">{title}</h3>
          <button type="button" className="crm-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="crm-modal__body">{children}</div>
        {footer && <div className="crm-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
