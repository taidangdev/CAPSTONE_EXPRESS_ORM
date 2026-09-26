import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff, Bookmark, Settings, Trash2 } from "lucide-react";
import * as userApi from "../api/userApi";
import * as imageApi from "../api/imageApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import usePaginatedList from "../hooks/usePaginatedList";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import MasonryGrid from "../components/MasonryGrid";
import ImageCard from "../components/ImageCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import Avatar from "../components/Avatar";
import { Spinner } from "../components/Spinner";

const TABS = [
  { key: "created", label: "Đã tạo" },
  { key: "saved", label: "Đã lưu" },
];

export default function ManagePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("created");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetcher = useCallback(
    (params) => (tab === "created" ? userApi.getCreatedImages(params) : userApi.getSavedImages(params)),
    [tab],
  );

  const { items, loading, loadingMore, error, hasMore, loadMore, removeItem } = usePaginatedList(
    fetcher,
    [tab],
  );
  const sentinelRef = useIntersectionObserver(loadMore, { enabled: hasMore && !loading });

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await imageApi.deleteImage(pendingDeleteId);
      removeItem(pendingDeleteId);
      toast.success("Đã xoá ảnh");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar user={user} size={64} />
          <div>
            <h1 className="text-lg font-bold text-neutral-900">{user?.fullName}</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
        </div>
        <Link
          to="/profile/edit"
          className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          <Settings size={16} /> Sửa hồ sơ
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <MasonryGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </MasonryGrid>
        ) : error ? (
          <EmptyState icon={ImageOff} title="Không tải được danh sách" description={error} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={tab === "created" ? ImageOff : Bookmark}
            title={tab === "created" ? "Bạn chưa đăng ảnh nào" : "Bạn chưa lưu ảnh nào"}
            description={
              tab === "created"
                ? "Bấm nút Đăng ảnh ở góc trên để chia sẻ ảnh đầu tiên."
                : "Lưu ảnh bạn thích để xem lại ở đây."
            }
          />
        ) : (
          <>
            <MasonryGrid>
              {items.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  action={
                    tab === "created" && (
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(image.id)}
                        className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-600"
                        aria-label="Xoá ảnh"
                      >
                        <Trash2 size={15} />
                      </button>
                    )
                  }
                />
              ))}
            </MasonryGrid>
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore && <Spinner />}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Xoá ảnh này?"
        description="Bình luận và lượt lưu của ảnh cũng sẽ bị xoá theo. Không thể hoàn tác."
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
