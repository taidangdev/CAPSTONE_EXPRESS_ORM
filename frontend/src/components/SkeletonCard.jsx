// Khung chờ hiển thị trong lúc ảnh chưa tải xong, kích thước xen kẽ cho
// giống bố cục masonry thật, tránh cảm giác "trống trải" khi mới vào trang.
const HEIGHTS = ["h-48", "h-64", "h-56", "h-72", "h-40"];

export default function SkeletonCard({ index = 0 }) {
  return (
    <div className={`mb-4 w-full animate-pulse rounded-2xl bg-neutral-200 ${HEIGHTS[index % HEIGHTS.length]}`} />
  );
}
