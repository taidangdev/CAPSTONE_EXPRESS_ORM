import { Link, Outlet } from "react-router-dom";
import { ImagePlus } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-neutral-900">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-white">
            <ImagePlus size={18} />
          </span>
          <span className="text-lg">PinNest</span>
        </Link>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
