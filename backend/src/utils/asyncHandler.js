// Bọc controller async: bắt lỗi và chuyển cho errorHandler thay vì để
// controller phải tự try/catch. Controller vì vậy chỉ còn logic thuần.
//
// Lưu ý: Express 5 (bản đang dùng trong project) đã tự động bắt Promise bị
// reject từ route handler và chuyển vào errorHandler, kể cả không có
// asyncHandler (đã kiểm tra thực tế). Vẫn giữ hàm này và dùng ở mọi
// controller để code tường minh, dễ đọc, và không phụ thuộc vào hành vi
// ngầm định của một phiên bản Express cụ thể.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
