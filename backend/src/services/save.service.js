import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

async function ensureImageExists(imageId) {
  const image = await prisma.image.findUnique({ where: { id: imageId }, select: { id: true } });
  if (!image) {
    throw ApiError.notFound("Không tìm thấy ảnh");
  }
}

export const isSaved = async (imageId, userId) => {
  await ensureImageExists(imageId);

  const saved = await prisma.savedImage.findUnique({
    where: { userId_imageId: { userId, imageId } },
  });

  return { saved: Boolean(saved) };
};

export const saveImage = async (imageId, userId) => {
  await ensureImageExists(imageId);

  // upsert thay vì create: lưu lại một ảnh đã lưu vẫn thành công bình
  // thường, không ném lỗi trùng khoá chính. API idempotent — gọi bao nhiêu
  // lần cũng ra cùng kết quả, frontend không cần lo trạng thái double-click.
  await prisma.savedImage.upsert({
    where: { userId_imageId: { userId, imageId } },
    create: { userId, imageId },
    update: {},
  });
};

export const unsaveImage = async (imageId, userId) => {
  await ensureImageExists(imageId);

  // deleteMany thay vì delete: không ném lỗi khi không có bản ghi nào khớp,
  // nên bỏ lưu một ảnh chưa từng lưu vẫn thành công bình thường (idempotent).
  await prisma.savedImage.deleteMany({ where: { userId, imageId } });
};

export default { isSaved, saveImage, unsaveImage };
