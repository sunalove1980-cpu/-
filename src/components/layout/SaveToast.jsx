import { useEffect } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import './SaveToast.css';

export default function SaveToast() {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(clearToast, 2200);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="save-toast" role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
