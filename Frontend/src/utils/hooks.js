// src/utils/hooks.js
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Central error mapper. Returns a user-facing message; on 401 it logs out silently
// (ProtectedRoute then redirects to /login with state.from). The returned function is
// STABLE (safe in effect deps) because AuthContext's `logout` changes identity every render.
export function useApiError() {
  const auth = useAuth();
  const ref = useRef(auth);
  ref.current = auth;
  return useCallback((err) => {
    if (err?.status === 401) { ref.current.logout(); return "Your session has expired. Please log in."; }
    if (err?.status === 403) return "You're not allowed to do that.";
    if (err?.status === 409 || err?.status === 422) return err.message;
    if (!err?.status) return "Can't reach the server. Please try again.";
    if (err.status >= 500) return "Something went wrong. Please try again.";
    return err.message;
  }, []);
}
