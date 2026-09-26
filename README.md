# Capstone Express ORM — Pinterest Clone

Ứng dụng chia sẻ ảnh kiểu Pinterest, làm cho bài tập lớn môn Backend (ExpressJS + ORM). Người dùng đăng ký/đăng nhập, đăng ảnh, xem/tìm kiếm ảnh, bình luận, và lưu ảnh yêu thích.

- Yêu cầu đề bài: [doc/Functional_Specification.md](doc/Functional_Specification.md)
- Mô hình ERD tham khảo: [doc/ERD.png](doc/ERD.png)
- Các quyết định kỹ thuật và lý do (đáng đọc trước khi sửa code): [doc/DECISIONS.md](doc/DECISIONS.md)
- Kế hoạch phát triển chi tiết theo từng giai đoạn: [doc/ROADMAP.md](doc/ROADMAP.md)

## Tech stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js, Express 5 |
| ORM | Prisma 7 (kết nối MySQL qua `@prisma/adapter-mariadb`) |
| Database | MySQL 8.4, chạy trong Docker khi phát triển ở local |
| Xác thực | JWT (jsonwebtoken) + bcrypt |
| Upload ảnh | Multer (memory storage) + Cloudinary |
| Validate | Zod |
| Frontend | React (Vite) |

> ⚠️ Prisma 7 sinh Prisma Client dưới dạng file TypeScript (`.ts`), dự án vẫn viết JavaScript bình thường vì Node 22.18+ tự lược bỏ kiểu (type stripping) khi import file `.ts`. Chi tiết xem [doc/DECISIONS.md](doc/DECISIONS.md).

## Cài đặt và chạy ở local

Yêu cầu: **Node.js 22.18 trở lên**, Docker.

### 1. Bật MySQL bằng Docker

```bash
docker compose up -d
```

MySQL sẽ chạy ở cổng **3308** (không phải 3306 mặc định, để tránh trùng với MySQL khác đang chạy sẵn trên máy).

### 2. Cấu hình biến môi trường

```bash
cd backend
cp .env.example .env
```

Mở `backend/.env`, điền các giá trị:

- `DATABASE_URL`: giữ nguyên nếu dùng đúng cấu hình Docker ở bước 1
- `JWT_SECRET`: đổi thành một chuỗi ngẫu nhiên dài (không dùng giá trị mẫu khi deploy thật)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: lấy từ [Cloudinary Dashboard](https://cloudinary.com/console) sau khi tạo tài khoản miễn phí

### 3. Cài thư viện, tạo bảng, và tạo dữ liệu mẫu

```bash
npm install          # tự chạy "prisma generate" qua script postinstall
npm run db:migrate    # tạo bảng trong MySQL theo prisma/schema.prisma
npm run db:seed       # tạo 3 user mẫu, 20 ảnh, kèm bình luận và lượt lưu
```

Sau khi seed, có thể đăng nhập thử bằng:

```
email: an@seed.local
password: password123
```

(hai tài khoản mẫu khác: `binh@seed.local`, `chi@seed.local`, cùng mật khẩu)

### 4. Chạy server

```bash
npm run dev
```

Server chạy ở `http://localhost:3000`. Kiểm tra nhanh: `GET http://localhost:3000/api/health` phải trả `{"status":"ok"}`.

### Các script khác

| Lệnh | Việc |
|---|---|
| `npm run db:studio` | Mở giao diện xem/sửa dữ liệu (Prisma Studio) |
| `npm run db:reset` | Xoá sạch DB và chạy lại toàn bộ migration |
| `npm run db:seed` | Tạo lại dữ liệu mẫu (chạy được nhiều lần, tự dọn dữ liệu mẫu cũ) |

## Test API bằng Postman

Import file [doc/postman/Capstone-Express-ORM.postman_collection.json](doc/postman/Capstone-Express-ORM.postman_collection.json) vào Postman.

1. Chạy request **Auth → Đăng nhập** (mặc định dùng tài khoản seed `an@seed.local`). Token trả về **tự động lưu** vào biến collection `token`.
2. Mọi request cần đăng nhập khác tự dùng `{{token}}` qua header `Authorization`.
3. Đổi biến collection `imageId` thành id ảnh có thật để test các API theo ảnh (chi tiết, bình luận, lưu ảnh...).

## Danh sách API

Base URL: `/api`. Cột **Auth**: 🔓 public, 🔒 cần JWT (header `Authorization: Bearer <token>`).

| Nhóm | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| Auth | POST | `/auth/register` | 🔓 | Đăng ký |
| Auth | POST | `/auth/login` | 🔓 | Đăng nhập, trả về token |
| Users | GET | `/users/me` | 🔒 | Thông tin cá nhân |
| Users | PUT | `/users/me` | 🔒 | Sửa họ tên, tuổi, avatar |
| Users | GET | `/users/me/created-images` | 🔒 | Ảnh đã tạo |
| Users | GET | `/users/me/saved-images` | 🔒 | Ảnh đã lưu |
| Images | GET | `/images` | 🔓 | Danh sách ảnh (phân trang) |
| Images | GET | `/images/search` | 🔓 | Tìm ảnh theo tên |
| Images | GET | `/images/:id` | 🔓 | Chi tiết ảnh + người tạo |
| Images | POST | `/images` | 🔒 | Đăng ảnh mới (multipart) |
| Images | DELETE | `/images/:id` | 🔒 | Xoá ảnh (chỉ chủ ảnh) |
| Comments | GET | `/images/:id/comments` | 🔓 | Danh sách bình luận |
| Comments | POST | `/images/:id/comments` | 🔒 | Thêm bình luận |
| Save | GET | `/images/:id/saved` | 🔒 | Đã lưu ảnh này chưa |
| Save | POST | `/images/:id/save` | 🔒 | Lưu ảnh |
| Save | DELETE | `/images/:id/save` | 🔒 | Bỏ lưu ảnh |

Chi tiết thiết kế từng API, schema DB, và các quyết định kỹ thuật: xem [doc/DECISIONS.md](doc/DECISIONS.md).

## Cấu trúc thư mục

```
Capstone-express-ORM/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       Định nghĩa model, map sang tên bảng tiếng Việt theo ERD
│   │   ├── migrations/
│   │   └── seed.js             Script tạo dữ liệu mẫu
│   └── src/
│       ├── config/             env, prisma client, cloudinary
│       ├── routes/              route → controller
│       ├── controllers/         đọc req, gọi service, trả res
│       ├── services/            logic nghiệp vụ + truy vấn Prisma
│       ├── middlewares/         auth (JWT), validate (zod), upload (multer), error handler
│       ├── validations/         schema zod cho từng nhóm API
│       ├── constants/           select field dùng chung (không lộ password)
│       └── utils/               ApiError, response, pagination, jwt
├── frontend/                    React (Vite)
├── doc/                          tài liệu: đề bài, ERD, quyết định kỹ thuật, roadmap, Postman
└── docker-compose.yml            MySQL cho môi trường phát triển
```
