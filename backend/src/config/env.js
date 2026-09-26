// Đọc và kiểm tra biến môi trường một lần duy nhất khi server khởi động.
// Thiếu biến bắt buộc thì dừng ngay ở đây, tránh chạy được rồi lỗi lúc có request.
import "dotenv/config";

const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Thiếu biến môi trường bắt buộc: ${missing.join(", ")}`);
  console.error("Kiểm tra lại file backend/.env (xem mẫu ở backend/.env.example)");
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export const isProduction = env.nodeEnv === "production";

export default env;
