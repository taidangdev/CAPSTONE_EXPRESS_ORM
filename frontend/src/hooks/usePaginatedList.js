import { useCallback, useEffect, useRef, useState } from "react";

const LIMIT = 20;

// Hook dùng chung cho MỌI danh sách có phân trang trong app (ảnh ở trang
// chủ/tìm kiếm/quản lý, hoặc bình luận ở trang chi tiết). Nhận vào một hàm
// "fetcher" (page, limit) => { items, page, totalPages, ... } và mảng
// "deps": đổi deps (ví dụ từ khoá tìm kiếm) thì tự tải lại từ trang 1.
export default function usePaginatedList(fetcher, deps) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // đang tải trang đầu
  const [loadingMore, setLoadingMore] = useState(false); // đang tải thêm
  const [error, setError] = useState(null);

  // Đánh số mỗi lần gọi load(): nếu deps đổi trong lúc request cũ chưa xong,
  // kết quả trả về muộn của request cũ sẽ bị bỏ qua thay vì đè lên dữ liệu mới.
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (pageToLoad, append) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const result = await fetcher({ page: pageToLoad, limit: LIMIT });
        if (requestId !== requestIdRef.current) return;
        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setPage(result.page);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.message || "Không tải được dữ liệu");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetcher],
  );

  useEffect(() => {
    setItems([]);
    load(1, false);
    // Cố ý chỉ theo dõi "deps" do nơi gọi truyền vào (không phải "load", vì
    // "load" đổi tham chiếu mỗi khi fetcher đổi, nhưng ta chỉ muốn reset khi
    // deps thay đổi thật sự, ví dụ từ khoá tìm kiếm).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || page >= totalPages) return;
    load(page + 1, true);
  }, [load, loading, loadingMore, page, totalPages]);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    loadMore,
    removeItem,
    setItems,
  };
}
