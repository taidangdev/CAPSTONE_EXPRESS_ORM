import { z } from "zod";
import { paginationSchema } from "./common.validation.js";

export const createImageSchema = z.object({
  name: z.string().trim().min(1, "Tên ảnh không được để trống").max(255),
  description: z.string().trim().max(1000).optional(),
});

export const searchImageSchema = paginationSchema.extend({
  name: z.string().trim().min(1, "Vui lòng nhập từ khoá tìm kiếm"),
});
