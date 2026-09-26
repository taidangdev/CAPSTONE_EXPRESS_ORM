export default function FormField({ label, error, children }) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
