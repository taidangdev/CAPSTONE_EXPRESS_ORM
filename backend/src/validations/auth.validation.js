import { z } from "zod";

// Lưu ý thứ tự: z.string().trim().toLowerCase() chạy TRƯỚC, .pipe(z.email())
// chạy validate email SAU cùng. Nếu viết z.email().trim() thì .email() sẽ
// kiểm tra định dạng trên chuỗi còn nguyên khoảng trắng và chữ hoa, vì các
// "check" và "transform" trong zod chạy tuần tự theo thứ tự khai báo.
const emailField = z.string().trim().toLowerCase().pipe(z.email("Email không hợp lệ"));

export const registerSchema = z.object({
  email: emailField,
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().trim().min(1, "Họ tên không được để trống").max(255),
  age: z.coerce.number().int().min(1).max(150).optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Mật khẩu không được để trống"),
});
