import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import * as userService from "../services/user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  // req.user.id lấy từ token qua middleware protect(), KHÔNG nhận từ params
  // hay body, đúng yêu cầu của đề bài.
  const user = await userService.getMe(req.user.id);
  ok(res, user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, {
    ...req.body,
    avatarFile: req.file,
  });
  ok(res, user, "Cập nhật thông tin thành công");
});

export const getCreatedImages = asyncHandler(async (req, res) => {
  const result = await userService.getCreatedImages(req.user.id, req.query);
  ok(res, result);
});

export const getSavedImages = asyncHandler(async (req, res) => {
  const result = await userService.getSavedImages(req.user.id, req.query);
  ok(res, result);
});
