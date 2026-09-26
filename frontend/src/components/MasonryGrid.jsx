// Lưới kiểu Pinterest bằng CSS columns — mỗi ảnh tự "rơi" vào cột ngắn nhất
// còn lại. Không cần thư viện masonry riêng, chỉ cần "break-inside-avoid" ở
// từng item (đặt trong ImageCard) để một ảnh không bị cắt làm đôi giữa 2 cột.
export default function MasonryGrid({ children }) {
  return <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">{children}</div>;
}
