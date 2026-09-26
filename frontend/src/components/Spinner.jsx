import { Loader2 } from "lucide-react";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
