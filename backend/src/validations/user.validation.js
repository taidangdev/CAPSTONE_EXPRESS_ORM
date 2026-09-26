import { z } from "zod";

// Giai đoạn 2: chỉ sửa họ tên và tuổi. Trường avatar (file upload) sẽ được
// thêm ở giai đoạn 3 cùng với Cloudinary.
export const updateMeSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên không được để trống").max(255).optional(),
  age: z.coerce.number().int().min(1).max(150).optional(),
});
