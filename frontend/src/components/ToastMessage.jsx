export default function ToastMessage({ type = "info", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}