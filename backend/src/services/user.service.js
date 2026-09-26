import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { userPublicSelect } from "../constants/select.js";
import * as cloudinaryService from "./cloudinary.service.js";

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

export const updateMe = async (userId, { fullName, age, avatarFile }) => {
  const data = {
    ...(fullName !== undefined ? { fullName } : {}),
    ...(age !== undefined ? { age } : {}),
  };

  // Không có avatar mới thì cập nhật bình thường, không đụng gì tới Cloudinary.
  if (!avatarFile) {
    return prisma.user.update({ where: { id: userId }, data, select: userPublicSelect });
  }

  const uploaded = await cloudinaryService.uploadImage(avatarFile.buffer, "capstone/avatars");

  try {
    // Lấy avatarPublicId CŨ trước khi ghi đè, để xoá file cũ trên Cloudinary
    // sau khi đã chắc chắn DB cập nhật thành công.
    const before = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarPublicId: true },
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...data, avatar: uploaded.url, avatarPublicId: uploaded.publicId },
      select: userPublicSelect,
    });

    if (before?.avatarPublicId) {
      await cloudinaryService.deleteImage(before.avatarPublicId);
    }

    return user;
  } catch (err) {
    // Cập nhật DB thất bại thì xoá luôn avatar vừa upload, tránh để lại rác.
    await cloudinaryService.deleteImage(uploaded.publicId);
    throw err;
  }
};

export default { getMe, updateMe };
