import { z } from "zod";

export const createImageSchema = z.object({
  name: z.string().trim().min(1, "Tên ảnh không được để trống").max(255),
  description: z.string().trim().max(1000).optional(),
});
