import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import * as cloudinaryService from "./cloudinary.service.js";
import { toSkipTake, buildPageResult } from "../utils/pagination.js";
import { userPublicSelect } from "../constants/select.js";

// Field trả về cho danh sách ảnh (trang chủ, tìm kiếm). Không include cả
// user ở đây để response gọn nhẹ hơn khi trả nhiều ảnh cùng lúc; thông tin
// người tạo chỉ cần thiết ở trang chi tiết (getImageById).
const imageListSelect = {
  id: true,
  name: true,
  url: true,
  description: true,
  width: true,
  height: true,
  userId: true,
  createdAt: true,
  _count: { select: { comments: true, savedBy: true } },
};

// Prisma trả field đếm dưới dạng { _count: { comments, savedBy } }. Đổi
// sang { commentsCount, savedCount } phẳng hơn, dễ dùng ở frontend, và
// không lộ tên field nội bộ "savedBy" ra ngoài API.
function withCounts(image) {
  const { _count, ...rest } = image;
  return {
    ...rest,
    commentsCount: _count?.comments ?? 0,
    savedCount: _count?.savedBy ?? 0,
  };
}

export const createImage = async ({ userId, name, description, file }) => {
  const uploaded = await cloudinaryService.uploadImage(file.buffer, "capstone/images");

  try {
    const image = await prisma.image.create({
      data: {
        name,
        description,
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        userId,
      },
    });
    return image;
  } catch (err) {
    // Lưu DB thất bại thì phải xoá file vừa upload, nếu không sẽ để lại
    // file rác trên Cloudinary mà không bản ghi nào tham chiếu tới.
    await cloudinaryService.deleteImage(uploaded.publicId);
    throw err;
  }
};

export const deleteImage = async (imageId, userId) => {
  const image = await prisma.image.findUnique({ where: { id: imageId } });

  if (!image) {
    throw ApiError.notFound("Không tìm thấy ảnh");
  }
  if (image.userId !== userId) {
    throw ApiError.forbidden("Bạn không có quyền xoá ảnh này");
  }

  // Xoá bản ghi trước: bình luận và lượt lưu của ảnh tự xoá theo (ON DELETE
  // CASCADE trong schema.prisma). Xoá file trên Cloudinary sau cùng, vì nếu
  // xoá DB thất bại thì ảnh vẫn còn dùng được, không bị mất file oan.
  await prisma.image.delete({ where: { id: imageId } });
  await cloudinaryService.deleteImage(image.publicId);
};

export const listImages = async ({ page, limit }) => {
  // $transaction chạy findMany và count trong cùng một transaction, đảm bảo
  // totalItems khớp đúng với thời điểm lấy items, tránh lệch số khi có ảnh
  // mới được thêm/xoá giữa hai truy vấn.
  const [items, totalItems] = await prisma.$transaction([
    prisma.image.findMany({
      ...toSkipTake({ page, limit }),
      orderBy: { createdAt: "desc" },
      select: imageListSelect,
    }),
    prisma.image.count(),
  ]);

  return buildPageResult({ items: items.map(withCounts), totalItems, page, limit });
};

export const searchImages = async ({ name, page, limit }) => {
  // Không cần "mode: insensitive": collation utf8mb4_unicode_ci của DB đã tự
  // bỏ qua hoa/thường và dấu (đã kiểm tra thực tế, xem doc/DECISIONS.md).
  const where = { name: { contains: name } };

  const [items, totalItems] = await prisma.$transaction([
    prisma.image.findMany({
      where,
      ...toSkipTake({ page, limit }),
      orderBy: { createdAt: "desc" },
      select: imageListSelect,
    }),
    prisma.image.count({ where }),
  ]);

  return buildPageResult({ items: items.map(withCounts), totalItems, page, limit });
};

export const getImageById = async (imageId) => {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
    select: {
      ...imageListSelect,
      updatedAt: true,
      // Chỉ chọn field an toàn của user (userPublicSelect), KHÔNG dùng
      // "include: { user: true }" — làm vậy sẽ trả luôn cột password.
      user: { select: userPublicSelect },
    },
  });

  if (!image) {
    throw ApiError.notFound("Không tìm thấy ảnh");
  }

  return withCounts(image);
};

export default { createImage, deleteImage, listImages, searchImages, getImageById };
