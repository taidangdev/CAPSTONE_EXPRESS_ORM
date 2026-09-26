import { useEffect, useRef } from "react";

// Gọi onIntersect() khi phần tử trả về (sentinel) lọt vào khung nhìn. Dùng
// làm "vạch đích" để tự tải thêm dữ liệu khi cuộn tới gần cuối trang.
export default function useIntersectionObserver(onIntersect, { enabled = true } = {}) {
  const targetRef = useRef(null);
  const callbackRef = useRef(onIntersect);

  // Đồng bộ callback mới nhất SAU khi render xong (không gán thẳng trong
  // thân hàm), để observer luôn gọi đúng bản loadMore mới nhất mà không
  // phải include onIntersect vào dependency của effect bên dưới (tránh phải
  // huỷ và tạo lại IntersectionObserver mỗi lần loadMore đổi tham chiếu).
  useEffect(() => {
    callbackRef.current = onIntersect;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const node = targetRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { rootMargin: "400px" }, // tải trước một chút, trước khi người dùng thấy đáy trang
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return targetRef;
}
