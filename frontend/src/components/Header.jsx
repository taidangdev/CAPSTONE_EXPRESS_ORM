import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, LogOut, User as UserIcon, ImagePlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useClickOutside from "../hooks/useClickOutside";
import Avatar from "./Avatar";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 font-bold text-neutral-900">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-white">
            <ImagePlus size={16} />
          </span>
          <span className="hidden sm:inline">PinNest</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="mx-auto w-full max-w-md flex-1">
          <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 focus-within:ring-2 focus-within:ring-brand-400">
            <Search size={18} className="shrink-0 text-neutral-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm ảnh..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
        </form>

        {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/upload"
              className="hidden items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 sm:flex"
            >
              <Plus size={16} /> Đăng ảnh
            </Link>
            <Link
              to="/upload"
              className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white sm:hidden"
              aria-label="Đăng ảnh"
            >
              <Plus size={18} />
            </Link>

            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen((v) => !v)} className="block">
                <Avatar user={user} size={36} />
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-neutral-100 px-4 py-2">
                    <p className="truncate text-sm font-semibold text-neutral-900">{user?.fullName}</p>
                    <p className="truncate text-xs text-neutral-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <UserIcon size={16} /> Quản lý ảnh
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
