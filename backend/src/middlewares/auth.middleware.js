import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import { userPublicSelect } from "../constants/select.js";

// Đọc "Authorization: Bearer <token>", trả về userId nếu hợp lệ, ném lỗi nếu
// thiếu, sai định dạng, sai chữ ký hoặc đã hết hạn. Không phân biệt các loại
// lỗi này ra thông báo riêng, tránh gợi ý cho kẻ tấn công biết token sai ở đâu.
function extractUserId(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Thiếu token xác thực");
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    return payload.userId;
  } catch {
    throw ApiError.unauthorized("Token không hợp lệ hoặc đã hết hạn");
  }
}

// Dùng cho mọi route bắt buộc đăng nhập. Truy vấn lại DB thay vì chỉ tin
// payload trong token, vì user có thể đã bị xoá sau khi token được phát ra.
export const protect = async (req, res, next) => {
  try {
    const userId = extractUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });

    if (!user) {
      throw ApiError.unauthorized("Người dùng không còn tồn tại");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Dùng cho route public nhưng cần biết user là ai NẾU đã đăng nhập (ví dụ:
// trang chủ vẫn xem được khi chưa đăng nhập, nhưng nếu đã đăng nhập thì có
// thể tô đậm ảnh đã lưu). Không có token hoặc token sai đều cho qua, chỉ
// khác là req.user sẽ là null.
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const userId = extractUserId(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });

    req.user = user ?? null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export default { protect, optionalAuth };
