export default function TextInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
        error
          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
          : "border-neutral-300 focus:border-brand-500 focus:ring-brand-500"
      } ${className}`}
    />
  );
}
