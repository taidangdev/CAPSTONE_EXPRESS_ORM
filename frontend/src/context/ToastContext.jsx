import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value = {
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`animate-toast-in flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              t.type === "error"
                ? "border-red-200 bg-red-50/95 text-red-800"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-800"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              aria-label="Đóng thông báo"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải được dùng bên trong <ToastProvider>");
  return ctx;
}
