# Quyết định kỹ thuật (Technical Decisions)

Tài liệu ghi lại các quyết định thiết kế của dự án **Capstone Express ORM**, một ứng dụng chia sẻ ảnh kiểu Pinterest, kèm lý do cho từng quyết định.

- Yêu cầu gốc: [Functional_Specification.md](Functional_Specification.md)
- ERD tham khảo: [ERD.png](ERD.png)

---

## 1. Tech stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Runtime | Node.js | 24.x |
| Backend | Express | 5.x |
| ORM | Prisma, dùng `@prisma/adapter-mariadb` để kết nối MySQL | **7.10.0** (ghim cố định) |
| Database | MySQL (Docker khi chạy local) | 8.4 |
| Frontend | React + Vite | React 19, Vite 8 |
| Routing / HTTP (FE) | react-router-dom, axios | 7.x, 1.x |
| UI | Tailwind CSS, bố cục masonry | — |
| Xác thực | jsonwebtoken, bcrypt | — |
| Upload ảnh | multer, Cloudinary | — |
| Validate dữ liệu | zod | — |
| Ngôn ngữ | JavaScript (ES Modules) | — |

> **Vì sao ghim Prisma 7.10.0?** Tag `latest` của gói `prisma` trên npm đang trỏ vào bản thử nghiệm `8.0.0-rc`, trong khi `@prisma/client` ổn định là 7.10.0. CLI và client bắt buộc phải cùng phiên bản, nên **không** chạy `npm i prisma@latest`.

> **Lưu ý quan trọng về Prisma 7:** generator `prisma-client` của Prisma 7 **chỉ sinh ra file TypeScript**, không có tuỳ chọn xuất ra JavaScript (`generatedFileExtension` chỉ nhận `ts`, `mts`, `cts`). Project này vẫn viết bằng JavaScript và chạy được, vì **Node 24 tự lược bỏ kiểu (type stripping) khi import file `.ts`**. Hệ quả:
> - Khi import Prisma Client phải **ghi rõ đuôi `.ts`**: `from "../generated/prisma/client.ts"`.
> - Chỉ import Prisma Client ở một chỗ duy nhất là `src/config/prisma.js`, các file khác import lại từ đó.
> - Client được sinh vào `src/generated/prisma/` và **không commit lên Git**. Script `postinstall` sẽ tự chạy `prisma generate` sau mỗi lần `npm install`, kể cả trên máy chủ khi deploy.
> - Khi deploy, nền tảng phải chạy Node 22.18 trở lên để có tính năng type stripping.

---

## 2. Các quyết định

### D1. Deploy
- **Quyết định:** Frontend deploy lên **Vercel**. Backend và MySQL cùng deploy lên **Railway**. Phương án dự phòng: backend lên Render, MySQL lên Aiven hoặc TiDB Cloud.
- **Lý do:** Docker MySQL chỉ dùng để phát triển ở local. Khi lên production cần một dịch vụ MySQL được host sẵn. Đặt backend và DB chung một nền tảng thì cấu hình ít hơn và độ trễ thấp hơn.
- **Hệ quả:** mọi cấu hình (DB, JWT, Cloudinary, CORS) đều lấy từ biến môi trường, không viết cứng trong code.

### D2. Lưu trữ ảnh trên Cloudinary
- **Quyết định:** ảnh (ảnh đăng và avatar) được upload lên **Cloudinary**. DB chỉ lưu URL và `public_id`.
- **Lý do:** Railway và Render không giữ file trên ổ đĩa, mỗi lần redeploy sẽ mất sạch. Lưu local thì ảnh không tồn tại lâu dài được.
- **Hệ quả:**
  - multer dùng `memoryStorage`, sau đó đẩy file lên Cloudinary.
  - Giới hạn **5MB** mỗi file, chỉ nhận `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
  - Khi xoá ảnh thì xoá cả file trên Cloudinary, dựa vào `public_id`.

### D3. Phân quyền API
- **Quyết định:** các API **đọc** thông tin ảnh (danh sách, tìm kiếm, chi tiết, bình luận) là **public**. Mọi API **ghi** và mọi API liên quan tới dữ liệu cá nhân **bắt buộc có JWT**.
- **Lý do:** giống Pinterest thật, khách chưa đăng nhập vẫn xem được ảnh, còn thông tin cá nhân và thao tác ghi thì được bảo vệ bằng token.
- **Hệ quả:**
  - Các API thao tác trên dữ liệu của chính user **lấy `userId` từ token**, không lấy từ params (theo đúng yêu cầu của đề).
  - Chỉ chủ ảnh mới được xoá ảnh. Người khác gọi sẽ nhận `403`.

### D4. Đặt tên: code tiếng Anh, DB tiếng Việt
- **Quyết định:** model và field trong Prisma dùng tiếng Anh (`User`, `Image`, `Comment`, `SavedImage`), rồi dùng `@@map` và `@map` để map sang tên bảng và cột tiếng Việt như trong ERD.
- **Lý do:** code JS dễ đọc và nhất quán (`prisma.image.findMany()`), trong khi DB vẫn khớp với ERD của đề bài.

### D5. Xoá ảnh: xoá hẳn và cascade
- **Quyết định:** `DELETE /images/:id` xoá hẳn bản ghi (hard delete). Khoá ngoại được đặt `onDelete: Cascade`, nên bình luận và lượt lưu của ảnh bị xoá theo.
- **Lý do:** đơn giản, đúng ngữ nghĩa của thao tác xoá, và tránh lỗi ràng buộc khoá ngoại.

### D6. Bổ sung API lưu / bỏ lưu ảnh
- **Quyết định:** thêm `POST /images/:id/save` và `DELETE /images/:id/save`.
- **Lý do:** đề bài chỉ có API *kiểm tra* đã lưu hay chưa, thiếu API để thực hiện lưu, nên nút Save không hoạt động được.
- **Hệ quả:** cả hai API đều **idempotent**, tức là gọi lại nhiều lần vẫn cho cùng kết quả. Lưu một ảnh đã lưu, hoặc bỏ lưu một ảnh chưa lưu, vẫn trả `200` chứ không báo lỗi.

### D7. Xác thực bằng access token
- **Quyết định:** chỉ dùng **access token**, gửi qua header `Authorization: Bearer <token>`, thời hạn **1 ngày** (`JWT_EXPIRES_IN`). Payload chỉ chứa `{ userId }`. Frontend lưu token trong `localStorage`.
- **Lý do:** frontend (Vercel) và backend (Railway) nằm khác domain. Dùng cookie khi đó phải cấu hình `SameSite=None; Secure`, rất dễ lỗi. Dùng Bearer header thì đơn giản và đủ cho phạm vi bài tập.
- **Hệ quả:**
  - Mật khẩu được hash bằng bcrypt (10 rounds).
  - Không API nào trả trường mật khẩu ra ngoài.
  - Refresh token để dành làm phần mở rộng.

### D8. Định dạng response thống nhất
Mọi API đều trả về cùng một dạng, và lỗi được xử lý tập trung trong một middleware.

```json
{ "statusCode": 200, "message": "Lấy danh sách ảnh thành công", "data": {} }
```

Với API có phân trang, `data` có dạng:

```json
{ "items": [], "page": 1, "limit": 20, "totalItems": 135, "totalPages": 7 }
```

Mã trạng thái sử dụng:

| Mã | Ý nghĩa |
|---|---|
| `200` / `201` | Thành công / Tạo mới thành công |
| `400` | Dữ liệu không hợp lệ (lỗi validate từ zod) |
| `401` | Thiếu token, token sai hoặc hết hạn |
| `403` | Không có quyền (ví dụ: xoá ảnh của người khác) |
| `404` | Không tìm thấy |
| `409` | Xung đột (ví dụ: email đã tồn tại) |
| `500` | Lỗi server |

### D9. Validate dữ liệu bằng zod
- **Quyết định:** mỗi route có một schema zod để kiểm tra `body`, `params` và `query`, chạy qua một middleware `validate` dùng chung.
- **Lý do:** gom toàn bộ luật kiểm tra dữ liệu về một chỗ, và thông báo lỗi trả về rõ ràng.

### D10. Phân trang kiểu offset
- **Quyết định:** dùng query `?page=1&limit=20`. Mặc định `limit` là 20, tối đa 50. Kết quả sắp xếp mới nhất trước.
- **Lý do:** đơn giản, dễ test bằng Postman. Frontend làm cuộn vô hạn bằng cách tăng dần `page`.

### D11. Giữ JavaScript, không chuyển sang TypeScript
- **Lý do:** project đã được dựng bằng JavaScript. Chuyển giữa chừng tốn công mà không phục vụ yêu cầu của đề.

### D12. Quy trình Git
- **Quyết định:**
  - Mỗi tính năng làm trên một nhánh `feature/<tên>`, xong thì merge vào `main`.
  - Commit theo quy ước [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `chore`, `docs`, `refactor`.
  - Không commit file `.env`. Luôn cập nhật file `.env.example` tương ứng.

---

## 3. Database schema

Có 4 bảng, giữ đúng tên bảng và tên cột như ERD. Cột nào được **thêm hoặc sửa** so với ERD sẽ in đậm.

### `nguoi_dung` (model `User`)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| nguoi_dung_id | INT | PK, auto increment |
| email | VARCHAR(255) | NOT NULL, **UNIQUE** |
| mat_khau | VARCHAR(255) | NOT NULL, lưu chuỗi bcrypt hash |
| ho_ten | VARCHAR(255) | NOT NULL |
| tuoi | INT | NULL |
| anh_dai_dien | VARCHAR(500) | NULL, URL Cloudinary |
| **anh_dai_dien_public_id** | VARCHAR(255) | NULL, dùng để xoá avatar cũ trên Cloudinary |
| **created_at / updated_at** | DATETIME | mặc định `now()` |

### `hinh_anh` (model `Image`)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| hinh_id | INT | PK, auto increment |
| ten_hinh | VARCHAR(255) | NOT NULL |
| duong_dan | VARCHAR(500) | NOT NULL, URL Cloudinary |
| **public_id** | VARCHAR(255) | NOT NULL, dùng để xoá file trên Cloudinary |
| mo_ta | VARCHAR(1000) | NULL |
| **chieu_rong / chieu_cao** | INT | NULL, kích thước ảnh do Cloudinary trả về, phục vụ bố cục masonry |
| nguoi_dung_id | INT | FK → nguoi_dung, **ON DELETE CASCADE** |
| **created_at / updated_at** | DATETIME | mặc định `now()` |

### `binh_luan` (model `Comment`)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| binh_luan_id | INT | PK, auto increment |
| nguoi_dung_id | INT | FK → nguoi_dung, **ON DELETE CASCADE** |
| hinh_id | INT | FK → hinh_anh, **ON DELETE CASCADE** |
| noi_dung | VARCHAR(1000) | NOT NULL |
| ngay_binh_luan | **DATETIME** (ERD ghi `date`) | mặc định `now()` |

### `luu_anh` (model `SavedImage`)
| Cột | Kiểu | Ràng buộc |
|---|---|---|
| nguoi_dung_id | INT | PK, FK → nguoi_dung, **ON DELETE CASCADE** |
| hinh_id | INT | PK, FK → hinh_anh, **ON DELETE CASCADE** |
| ngay_luu | **DATETIME** (ERD ghi `date`) | mặc định `now()` |

**Vì sao đổi `date` thành `datetime`:** kiểu `date` không lưu giờ phút, nên các bình luận hoặc lượt lưu trong cùng một ngày sẽ không sắp xếp đúng thứ tự được.

**Vì sao không tạo index cho `ten_hinh`:** tìm kiếm dùng `LIKE '%tên%'`. Dấu `%` đặt ở đầu chuỗi khiến MySQL không dùng được index thường, nên index chỉ tốn chỗ mà không tăng tốc. Nếu sau này dữ liệu lớn thì dùng FULLTEXT index.

**Không cần khai báo index cho khoá ngoại:** InnoDB tự tạo index cho mọi cột khoá ngoại.

**Tìm kiếm không phân biệt hoa thường và không phân biệt dấu:** Prisma tạo bảng với collation `utf8mb4_unicode_ci`, vốn bỏ qua cả hoa thường lẫn dấu. Đã kiểm tra thực tế: `'Hoà' LIKE '%hoa%'` trả về đúng. Vì vậy không cần xử lý thêm trong code.

### Migration
Migration đầu tiên: `prisma/migrations/20260926021403_init`. Đã kiểm tra trên DB thật: 4 bảng được tạo đúng tên, cả 5 khoá ngoại đều `ON DELETE CASCADE`, và thử xoá ảnh thì bình luận cùng lượt lưu bị xoá theo.

Các script trong `backend/package.json`:

| Script | Việc |
|---|---|
| `npm run db:migrate` | Tạo và áp dụng migration mới khi sửa schema (dùng ở local) |
| `npm run db:deploy` | Áp dụng migration đã có, không tạo mới (dùng khi deploy) |
| `npm run db:studio` | Mở giao diện xem và sửa dữ liệu |
| `npm run db:reset` | Xoá sạch DB rồi chạy lại toàn bộ migration |

---

## 4. Danh sách API

Base URL: `/api`. Cột **Auth** cho biết API có cần token hay không: 🔓 là public, 🔒 là bắt buộc có JWT.

| Trang | Method | Endpoint | Auth | Mô tả |
|---|---|---|---|---|
| Đăng ký | POST | `/auth/register` | 🔓 | Tạo tài khoản |
| Đăng nhập | POST | `/auth/login` | 🔓 | Trả về access token và thông tin user |
| Trang chủ | GET | `/images?page=&limit=` | 🔓 | Danh sách ảnh |
| Trang chủ | GET | `/images/search?name=&page=&limit=` | 🔓 | Tìm ảnh theo tên (không phân biệt hoa thường) |
| Chi tiết | GET | `/images/:id` | 🔓 | Thông tin ảnh kèm người tạo |
| Chi tiết | GET | `/images/:id/comments` | 🔓 | Danh sách bình luận kèm người bình luận |
| Chi tiết | GET | `/images/:id/saved` | 🔒 | User hiện tại đã lưu ảnh này chưa (`{ saved: boolean }`) |
| Chi tiết | POST | `/images/:id/comments` | 🔒 | Thêm bình luận |
| Chi tiết | POST | `/images/:id/save` | 🔒 | Lưu ảnh (bổ sung, xem D6) |
| Chi tiết | DELETE | `/images/:id/save` | 🔒 | Bỏ lưu ảnh (bổ sung, xem D6) |
| Quản lý | GET | `/users/me` | 🔒 | Thông tin user hiện tại |
| Quản lý | GET | `/users/me/saved-images?page=&limit=` | 🔒 | Danh sách ảnh đã lưu |
| Quản lý | GET | `/users/me/created-images?page=&limit=` | 🔒 | Danh sách ảnh đã tạo |
| Quản lý | DELETE | `/images/:id` | 🔒 | Xoá ảnh, chỉ chủ ảnh được xoá |
| Thêm ảnh | POST | `/images` | 🔒 | Upload ảnh (`multipart/form-data`) |
| Cá nhân | PUT | `/users/me` | 🔒 | Sửa họ tên, tuổi, avatar (`multipart/form-data`) |

> Đề bài ghi "danh sách ảnh theo **user id**". Theo mục *"Các API lấy thông tin cá nhân từ user thì nên lấy từ token"*, user id ở đây được lấy từ token (`/users/me/...`) thay vì truyền qua URL.

---

## 5. Môi trường

| Dịch vụ | Local | Ghi chú |
|---|---|---|
| Backend | `http://localhost:3000` | `npm run dev` trong thư mục `backend/` |
| Frontend | `http://localhost:5173` | `npm run dev` trong thư mục `frontend/` |
| MySQL | `localhost:3308` | `docker compose up -d`. Dùng cổng 3308 để tránh trùng với MySQL khác đang chạy trên máy |

Biến môi trường của backend (xem `backend/.env.example`):
`PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Biến môi trường của frontend: `VITE_API_URL`.

---

## 6. Ngoài phạm vi bắt buộc (làm sau nếu còn thời gian)

- Refresh token
- Đổi mật khẩu
- Xoá bình luận của chính mình
- Trang hồ sơ public của user khác (`/users/:id/created-images`)
- Tài liệu API bằng Swagger
- Tag hoặc danh mục cho ảnh
- Postman collection (bắt buộc khi nộp bài, làm sau khi hoàn thành các API)
