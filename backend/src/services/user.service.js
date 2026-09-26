import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { userPublicSelect } from "../constants/select.js";

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  // Về lý thuyết không thể xảy ra: protect() đã xác nhận user tồn tại trước
  // khi vào tới đây. Vẫn kiểm tra phòng trường hợp user bị xoá ngay giữa lúc
  // request đang xử lý.
  if (!user) {
    throw ApiError.notFound("Không tìm thấy người dùng");
  }

  return user;
};

export const updateMe = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: userPublicSelect,
  });

  return user;
};

export default { getMe, updateMe };
