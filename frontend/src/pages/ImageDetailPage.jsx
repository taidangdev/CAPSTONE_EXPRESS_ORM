import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Trash2, ImageOff, MessageCircle, Bookmark } from "lucide-react";
import * as imageApi from "../api/imageApi";
import * as commentApi from "../api/commentApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import usePaginatedList from "../hooks/usePaginatedList";
import { formatRelativeTime } from "../utils/formatDate";
import Avatar from "../components/Avatar";
import SaveButton from "../components/SaveButton";
import CommentForm from "../components/CommentForm";
import CommentList from "../components/CommentList";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { PageSpinner, Spinner } from "../components/Spinner";

export default function ImageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    imageApi
      .getImage(id)
      .then((data) => {
        if (!cancelled) setImage(data);
      })
      .catch((err) => {
        if (!cancelled && err.status === 404) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const commentFetcher = useCallback((params) => commentApi.listComments(id, params), [id]);
  const {
    items: comments,
    loading: commentsLoading,
    loadingMore: commentsLoadingMore,
    hasMore: hasMoreComments,
    loadMore: loadMoreComments,
    setItems: setComments,
  } = usePaginatedList(commentFetcher, [id]);

  async function handleAddComment(content) {
    try {
      const newComment = await commentApi.createComment(id, content);
      setComments((prev) => [newComment, ...prev]);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await imageApi.deleteImage(id);
      toast.success("Đã xoá ảnh");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) return <PageSpinner />;

  if (notFound || !image) {
    return (
      <EmptyState
        icon={ImageOff}
        title="Không tìm thấy ảnh này"
        description="Ảnh có thể đã bị xoá hoặc không tồn tại."
        action={
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:underline">
            Về trang chủ
          </Link>
        }
      />
    );
  }

  const isOwner = isAuthenticated && user?.id === image.userId;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Ảnh */}
        <div className="overflow-hidden rounded-2xl bg-neutral-100">
          <img src={image.url} alt={image.name} className="w-full object-cover" />
        </div>

        {/* Thông tin + bình luận */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-neutral-900">{image.name}</h1>
            {isOwner && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Xoá ảnh"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {image.description && <p className="mt-2 text-neutral-600">{image.description}</p>}

          <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <MessageCircle size={16} /> {image.commentsCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark size={16} /> {image.savedCount}
            </span>
            <span>{formatRelativeTime(image.createdAt)}</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-5">
            <div className="flex items-center gap-3">
              <Avatar user={image.user} size={44} />
              <div>
                <p className="text-sm font-semibold text-neutral-900">{image.user.fullName}</p>
                <p className="text-xs text-neutral-500">{image.user.email}</p>
              </div>
            </div>
            <SaveButton imageId={image.id} />
          </div>

          {/* Bình luận */}
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">
              Bình luận ({image.commentsCount})
            </h2>

            {isAuthenticated ? (
              <CommentForm onSubmit={handleAddComment} />
            ) : (
              <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
                <Link to="/login" className="font-semibold text-brand-600 hover:underline">
                  Đăng nhập
                </Link>{" "}
                để bình luận.
              </p>
            )}

            <div className="mt-5">
              {commentsLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : (
                <CommentList comments={comments} />
              )}

              {hasMoreComments && (
                <button
                  type="button"
                  onClick={loadMoreComments}
                  disabled={commentsLoadingMore}
                  className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-60"
                >
                  {commentsLoadingMore ? "Đang tải..." : "Xem thêm bình luận"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xoá ảnh này?"
        description="Bình luận và lượt lưu của ảnh cũng sẽ bị xoá theo. Không thể hoàn tác."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
