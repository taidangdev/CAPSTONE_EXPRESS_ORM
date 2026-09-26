import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import { userPublicSelect } from "../constants/select.js";
import { toSkipTake, buildPageResult } from "../utils/pagination.js";

// Trả 404 nếu ảnh không tồn tại, khác với việc trả mảng bình luận rỗng —
// hai trường hợp mang ý nghĩa khác nhau (ảnh không có vs ảnh chưa có bình luận).
async function ensureImageExists(imageId) {
  const image = await prisma.image.findUnique({ where: { id: imageId }, select: { id: true } });
  if (!image) {
    throw ApiError.notFound("Không tìm thấy ảnh");
  }
}

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  user: { select: userPublicSelect },
};

export const listComments = async (imageId, { page, limit }) => {
  await ensureImageExists(imageId);

  const where = { imageId };
  const [items, totalItems] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      ...toSkipTake({ page, limit }),
      orderBy: { createdAt: "desc" },
      select: commentSelect,
    }),
    prisma.comment.count({ where }),
  ]);

  return buildPageResult({ items, totalItems, page, limit });
};

export const createComment = async (imageId, userId, content) => {
  await ensureImageExists(imageId);

  // userId lấy từ tham số truyền vào (controller lấy từ req.user.id, tức từ
  // token), không có cách nào mạo danh user khác qua API này.
  return prisma.comment.create({
    data: { imageId, userId, content },
    select: commentSelect,
  });
};

export default { listComments, createComment };
