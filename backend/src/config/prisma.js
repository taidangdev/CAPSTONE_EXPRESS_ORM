// Nạp .env ngay tại đây để module này dùng được cả trong các script chạy riêng,
// không phụ thuộc vào việc file gọi nó đã nạp .env hay chưa.
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

if (!process.env.DATABASE_URL) {
  throw new Error("Thiếu biến môi trường DATABASE_URL. Kiểm tra lại file .env");
}

// Prisma 7 kết nối MySQL qua driver adapter, nên phải truyền adapter vào client.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({ adapter });

export default prisma;
