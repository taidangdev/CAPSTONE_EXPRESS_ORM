import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Nội dung bình luận không được để trống").max(1000),
});
