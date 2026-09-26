import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="404 — Không tìm thấy trang"
      description="Đường dẫn bạn truy cập không tồn tại."
      action={
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:underline">
          Về trang chủ
        </Link>
      }
    />
  );
}
