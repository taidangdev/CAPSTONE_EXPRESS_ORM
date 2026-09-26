import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { userPublicSelect } from "../constants/select.js";
import * as cloudinaryService from "./cloudinary.service.js";
import { listImagesByUser, imageListSelect, withCounts } from "./image.service.js";
import { toSkipTake, buildPageResult } from "../utils/pagination.js";

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

// Ảnh do user tạo: tái sử dụng thẳng logic phân trang của image.service.js,
// chỉ khác điều kiện lọc (userId của chính user đang đăng nhập).
export const getCreatedImages = (userId, { page, limit }) => {
  return listImagesByUser(userId, { page, limit });
};

export const getSavedImages = async (userId, { page, limit }) => {
  const where = { userId };

  // Sắp theo savedAt (thời điểm LƯU), không phải createdAt của ảnh — ảnh lưu
  // gần đây nhất lên đầu, đúng tinh thần "danh sách đã lưu" của trang quản lý.
  const [rows, totalItems] = await prisma.$transaction([
    prisma.savedImage.findMany({
      where,
      ...toSkipTake({ page, limit }),
      orderBy: { savedAt: "desc" },
      select: { image: { select: imageListSelect } },
    }),
    prisma.savedImage.count({ where }),
  ]);

  // Map về đúng dạng danh sách ảnh phẳng giống mọi API danh sách ảnh khác
  // (listImages, searchImages, getCreatedImages), để frontend dùng chung
  // một component hiển thị lưới ảnh cho cả 3 trường hợp.
  const items = rows.map((row) => withCounts(row.image));

  return buildPageResult({ items, totalItems, page, limit });
};

export default { getMe, updateMe, getCreatedImages, getSavedImages };
