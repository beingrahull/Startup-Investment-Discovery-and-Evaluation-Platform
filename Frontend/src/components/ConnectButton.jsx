import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useApiError } from "../utils/hooks";
import { canConnect, idOf } from "../utils/format";
import ConfirmModal from "./ConfirmModal";

export default function ConnectButton({ ask, size }) {
  const { user } = useAuth();
  const toast = useToast();
  const handleError = useApiError();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (!canConnect(user, ask)) return null;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await api.post("/api/connections", { ask: idOf(ask), message: message.trim() || undefined });
      toast.success("Connection request sent.");
      setSent(true);
      setOpen(false);
      setMessage("");
    } catch (err) {
      if (err.status === 409) {
        setSent(true);
        setError("You've already connected with this founder.");
      } else {
        setError(handleError(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""}`} disabled={sent && !open} onClick={() => { setError(""); setOpen(true); }}>
        {sent ? "Request sent" : "Connect"}
      </button>
      <ConfirmModal open={open} title={`Connect with ${ask.startupName}`} confirmLabel="Send request" onConfirm={submit} onCancel={() => setOpen(false)} busy={busy}>
        <div className="field">
          <label htmlFor="connect-msg">Message (optional)</label>
          <textarea id="connect-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Introduce yourself and why this interests you…" />
        </div>
        <div aria-live="polite">{error && <div className="form-error">{error}</div>}</div>
      </ConfirmModal>
    </>
  );
}
