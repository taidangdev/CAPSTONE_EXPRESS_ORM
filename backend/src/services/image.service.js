import prisma from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";
import * as cloudinaryService from "./cloudinary.service.js";

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

export default { createImage, deleteImage };
