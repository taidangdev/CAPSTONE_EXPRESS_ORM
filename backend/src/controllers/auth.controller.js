import asyncHandler from "../utils/asyncHandler.js";
import { created, ok } from "../utils/response.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result, "Đăng ký thành công");
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ok(res, result, "Đăng nhập thành công");
});
