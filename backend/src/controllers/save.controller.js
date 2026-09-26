import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import * as saveService from "../services/save.service.js";

export const isSaved = asyncHandler(async (req, res) => {
  const result = await saveService.isSaved(req.params.id, req.user.id);
  ok(res, result);
});

export const saveImage = asyncHandler(async (req, res) => {
  await saveService.saveImage(req.params.id, req.user.id);
  ok(res, null, "Lưu ảnh thành công");
});

export const unsaveImage = asyncHandler(async (req, res) => {
  await saveService.unsaveImage(req.params.id, req.user.id);
  ok(res, null, "Bỏ lưu ảnh thành công");
});
