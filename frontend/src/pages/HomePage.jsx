import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ImageOff, SearchX } from "lucide-react";
import * as imageApi from "../api/imageApi";
import usePaginatedList from "../hooks/usePaginatedList";
import useIntersectionObserver from "../hooks/useIntersectionObserver";
import MasonryGrid from "../components/MasonryGrid";
import ImageCard from "../components/ImageCard";
import SkeletonCard from "../components/SkeletonCard";
import EmptyState from "../components/EmptyState";
import { Spinner } from "../components/Spinner";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const fetcher = useCallback(
    ({ page, limit }) =>
      query
        ? imageApi.searchImages({ name: query, page, limit })
        : imageApi.listImages({ page, limit }),
    [query],
  );

  const { items, loading, loadingMore, error, hasMore, loadMore } = usePaginatedList(fetcher, [query]);
  const sentinelRef = useIntersectionObserver(loadMore, { enabled: hasMore && !loading });

  if (loading) {
    return (
      <MasonryGrid>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </MasonryGrid>
    );
  }

  if (error) {
    return <EmptyState icon={ImageOff} title="Không tải được ảnh" description={error} />;
  }

  if (items.length === 0) {
    return query ? (
      <EmptyState
        icon={SearchX}
        title={`Không tìm thấy ảnh nào cho "${query}"`}
        description="Thử tìm với từ khoá khác xem sao."
      />
    ) : (
      <EmptyState
        icon={ImageOff}
        title="Chưa có ảnh nào"
        description="Hãy là người đầu tiên đăng ảnh lên PinNest!"
      />
    );
  }

  return (
    <div>
      {query && (
        <p className="mb-4 text-sm text-neutral-500">
          Kết quả cho &quot;<span className="font-medium text-neutral-800">{query}</span>&quot;
        </p>
      )}

      <MasonryGrid>
        {items.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </MasonryGrid>

      <div ref={sentinelRef} className="flex justify-center py-8">
        {loadingMore && <Spinner />}
      </div>
    </div>
  );
}
