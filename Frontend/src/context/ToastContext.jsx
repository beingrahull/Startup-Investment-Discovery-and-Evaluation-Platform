import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((message, type = "info", ms = 4000) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  // Stable object so it's safe in effect deps.
  const value = useMemo(() => ({
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error", 6000),
    info: (m) => push(m, "info"),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
