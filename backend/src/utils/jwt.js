import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Payload chỉ chứa userId (xem doc/DECISIONS.md mục D7). Không nhét thêm dữ
// liệu hay thay đổi (email, role...) vào token, vì token không thể thu hồi
// giữa chừng — mọi thông tin cần mới nhất phải truy vấn lại từ DB.
export const signToken = (userId) => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

// Ném lỗi gốc của thư viện jsonwebtoken (TokenExpiredError, JsonWebTokenError)
// khi token sai hoặc hết hạn. Nơi gọi (auth.middleware.js) chịu trách nhiệm
// bắt lỗi và quy về ApiError.unauthorized().
export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export default { signToken, verifyToken };
