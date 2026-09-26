// Backend trả lỗi validate dạng { message, details: [{ field, message }] }.
// Đổi mảng details thành object { [field]: message } để hiện ngay dưới
// từng ô input.
export function fieldErrorsFromApiError(err) {
  const map = {};
  if (Array.isArray(err?.details)) {
    for (const d of err.details) map[d.field] = d.message;
  }
  return map;
}
