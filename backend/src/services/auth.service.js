import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";
import { userPublicSelect } from "../constants/select.js";

const SALT_ROUNDS = 10;

export const register = async ({ email, password, fullName, age }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("Email này đã được đăng ký");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, fullName, age },
    select: userPublicSelect,
  });

  const token = signToken(user.id);
  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Cố tình dùng CÙNG MỘT thông báo cho cả hai trường hợp "email không tồn
  // tại" và "sai mật khẩu". Nếu phân biệt hai lỗi này, kẻ tấn công có thể dò
  // ra được email nào đã đăng ký trong hệ thống (user enumeration).
  const invalidCredentialsError = ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  if (!user) {
    throw invalidCredentialsError;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  const token = signToken(user.id);

  // Phải query kèm password để bcrypt.compare so sánh được, nên không dùng
  // được userPublicSelect ngay từ findUnique. Sau khi xác thực xong, ép lại
  // kết quả về đúng bộ field của userPublicSelect (không chỉ đơn giản xoá
  // password), để response không lộ thêm các field khác như avatarPublicId.
  const publicUser = Object.fromEntries(
    Object.keys(userPublicSelect).map((key) => [key, user[key]]),
  );

  return { user: publicUser, token };
};

export default { register, login };
