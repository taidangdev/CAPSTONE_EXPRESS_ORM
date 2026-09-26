import multer from "multer";
import ApiError from "../utils/ApiError.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, xem doc/DECISIONS.md mục D2
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// memoryStorage giữ file trong RAM dưới dạng buffer, không ghi ra ổ đĩa. File
// sẽ được đẩy thẳng lên Cloudinary từ buffer này (xem cloudinary.service.js).
// Lý do bắt buộc: nền tảng deploy (Railway/Render) xoá sạch ổ đĩa mỗi lần
// redeploy, lưu ra đĩa cục bộ thì ảnh sẽ mất.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest("Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WEBP hoặc GIF"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
