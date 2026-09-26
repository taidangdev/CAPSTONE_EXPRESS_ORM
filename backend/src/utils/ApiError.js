// Lỗi nghiệp vụ có kèm mã trạng thái HTTP, để errorHandler biết trả về mã nào.
// Dùng ở service/controller thay cho throw new Error() thông thường.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message = "Dữ liệu không hợp lệ", details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Chưa đăng nhập hoặc token không hợp lệ") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Bạn không có quyền thực hiện thao tác này") {
    return new ApiError(403, message);
  }

  static notFound(message = "Không tìm thấy dữ liệu") {
    return new ApiError(404, message);
  }

  static conflict(message = "Dữ liệu đã tồn tại") {
    return new ApiError(409, message);
  }
}

export default ApiError;
