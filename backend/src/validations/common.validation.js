import { z } from "zod";

// Áp dụng ở query string, nên page/limit đến dưới dạng chuỗi. zod tự ép kiểu
// bằng coerce, rồi validate.middleware.js sẽ ghi số đã ép ngược lại vào req.
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Dùng cho mọi route có :id trên URL, ví dụ /images/:id
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
