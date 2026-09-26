import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { created, ok } from "../utils/response.js";
import * as imageService from "../services/image.service.js";

export const createImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest("Vui lòng chọn ảnh để đăng");
  }

  const image = await imageService.createImage({
    userId: req.user.id,
    name: req.body.name,
    description: req.body.description,
    file: req.file,
  });

  created(res, image, "Đăng ảnh thành công");
});

export const deleteImage = asyncHandler(async (req, res) => {
  await imageService.deleteImage(req.params.id, req.user.id);
  ok(res, null, "Xoá ảnh thành công");
});
