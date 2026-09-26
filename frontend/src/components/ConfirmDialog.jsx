import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xoá",
  cancelLabel = "Huỷ",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-neutral-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
            }`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
