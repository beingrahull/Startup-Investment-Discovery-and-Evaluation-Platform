import { cloneElement, isValidElement, useId } from "react";

export default function Field({ label, error, hint, children }) {
  const id = useId();
  const child = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-err` : undefined,
      })
    : children;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {child}
      {hint && !error && <small className="muted">{hint}</small>}
      {error && <small id={`${id}-err`} className="field-error" role="alert">{error}</small>}
    </div>
  );
}
