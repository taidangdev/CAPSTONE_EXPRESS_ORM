import ApiError from "../utils/ApiError.js";
import { isProduction } from "../config/env.js";

// Gắn ở route cuối cùng, sau mọi router khác. Bắt các request không khớp
// route nào và chuyển thành lỗi 404 đi qua errorHandler cho đúng định dạng chung.
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`));
};

// Middleware xử lý lỗi tập trung. PHẢI có đủ 4 tham số (err, req, res, next)
// thì Express mới nhận diện đây là error handler.
export const errorHandler = (err, req, res, next) => {
  const isKnownError = err instanceof ApiError;
  const prismaMessage = mapPrismaErrorMessage(err);
  const multerMessage = mapMulterErrorMessage(err);
  const knownMessage = prismaMessage || multerMessage;
  const statusCode = isKnownError ? err.statusCode : knownMessage ? knownMessage.statusCode : 500;

  let message = "Lỗi hệ thống, vui lòng thử lại sau";
  if (isKnownError) message = err.message;
  else if (knownMessage) message = knownMessage.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    statusCode,
    message,
    data: null,
    ...(isKnownError && err.details ? { details: err.details } : {}),
    // Chỉ hiện stack trace khi không phải môi trường production, giúp debug
    // ở local nhưng không lộ chi tiết hệ thống cho người dùng thật.
    ...(!isProduction && statusCode === 500 ? { stack: err.stack } : {}),
  });
};

// Prisma ném lỗi có mã P2xxx. Quy các mã hay gặp về mã HTTP và thông báo
// tiếng Việt chung chung, không lộ nguyên văn thông báo lỗi của Prisma.
function mapPrismaErrorMessage(err) {
  if (err?.code === "P2002") {
    return { statusCode: 409, message: "Dữ liệu đã tồn tại" }; // vi phạm ràng buộc unique
  }
  if (err?.code === "P2025") {
    return { statusCode: 404, message: "Không tìm thấy dữ liệu" }; // không có bản ghi để update/delete
  }
  return null;
}

// multer ném lỗi có name === "MulterError" với các mã LIMIT_*. Quy về thông
// báo tiếng Việt, không lộ nguyên văn thông báo tiếng Anh của multer.
function mapMulterErrorMessage(err) {
  if (err?.name !== "MulterError") return null;
  if (err.code === "LIMIT_FILE_SIZE") {
    return { statusCode: 400, message: "File ảnh vượt quá dung lượng cho phép (tối đa 5MB)" };
  }
  return { statusCode: 400, message: "Upload file thất bại" };
}
