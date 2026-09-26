import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import * as saveApi from "../api/saveApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SaveButton({ imageId }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(isAuthenticated);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return undefined;
    }
    let cancelled = false;
    setChecking(true);
    saveApi
      .isSaved(imageId)
      .then((res) => {
        if (!cancelled) setSaved(res.saved);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [imageId, isAuthenticated]);

  async function toggle() {
    if (!isAuthenticated) {
      toast.error("Đăng nhập để lưu ảnh bạn thích");
      return;
    }

    const next = !saved;
    setSaved(next); // cập nhật giao diện ngay (optimistic update)
    setPending(true);
    try {
      if (next) await saveApi.saveImage(imageId);
      else await saveApi.unsaveImage(imageId);
    } catch (err) {
      setSaved(!next); // thất bại thì trả về trạng thái cũ
      toast.error(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={checking || pending}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
        saved
          ? "bg-brand-600 text-white hover:bg-brand-700"
          : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
      }`}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
      {saved ? "Đã lưu" : "Lưu"}
    </button>
  );
}
