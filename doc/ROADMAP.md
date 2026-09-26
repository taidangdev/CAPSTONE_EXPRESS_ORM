# Kế hoạch phát triển

Lộ trình thi công dự án **Capstone Express ORM**, chia thành 13 giai đoạn. Mỗi giai đoạn là **một nhánh Git, một commit hoặc một nhóm commit, và kết thúc bằng một mốc có thể test được**.

- Yêu cầu: [Functional_Specification.md](Functional_Specification.md)
- Quyết định kỹ thuật: [DECISIONS.md](DECISIONS.md)

---

## Phân tích lại chức năng

Đề bài mô tả 5 trang. Quy về **4 nhóm nghiệp vụ**:

| Nhóm | Nghiệp vụ | Trang liên quan |
|---|---|---|
| **Tài khoản** | Đăng ký, đăng nhập, xem và sửa thông tin cá nhân | Đăng ký, Đăng nhập, Chỉnh sửa cá nhân |
| **Ảnh** | Xem danh sách, tìm kiếm, xem chi tiết, đăng ảnh, xoá ảnh | Trang chủ, Chi tiết, Thêm ảnh, Quản lý |
| **Bình luận** | Xem bình luận của ảnh, thêm bình luận | Chi tiết |
| **Lưu ảnh** | Kiểm tra đã lưu, lưu, bỏ lưu, xem danh sách đã lưu | Chi tiết, Quản lý |

### Ba điểm cần chú ý khi đọc đề

1. **Đề thiếu API lưu / bỏ lưu ảnh.** Đề chỉ có API *kiểm tra* đã lưu hay chưa. Không có API lưu thì nút Save không hoạt động được, nên phải bổ sung.
2. **"Theo user id" nghĩa là lấy từ token.** Đề ghi *"GET danh sách ảnh đã lưu theo user id"*, nhưng bên dưới lại ghi *"Các API lấy thông tin cá nhân từ user thì nên lấy từ token để xử lý"*. Hai câu này phải hiểu cùng nhau: user id lấy từ token, không nhận từ URL. Nếu nhận từ URL thì ai cũng xem được dữ liệu của người khác.
3. **Xoá ảnh phải kiểm tra quyền.** Đề chỉ ghi *"DELETE xóa ảnh đã tạo theo id ảnh"*. Nếu không kiểm tra, người dùng A sẽ xoá được ảnh của người dùng B. Đây là lỗi bảo mật nặng nhất mà bài này dễ mắc.

### Quy ước code clean áp dụng xuyên suốt

Đây là các luật bắt buộc, giai đoạn nào cũng phải giữ:

| Luật | Nội dung |
|---|---|
| **Một việc một lớp** | `route` khai báo đường dẫn. `controller` đọc `req` và trả `res`. `service` chứa logic và truy vấn DB. Không đảo vai. |
| **Controller không gọi Prisma** | Mọi truy vấn DB nằm trong `service`. Controller chỉ gọi service. |
| **Service không biết `req` và `res`** | Service nhận tham số thường và trả về dữ liệu thường. Nhờ vậy service test được độc lập và tái sử dụng được. |
| **Không bao giờ trả mật khẩu** | Mọi truy vấn user đều dùng `select` định nghĩa sẵn, không dùng `SELECT *`. |
| **Không `try/catch` trong controller** | Dùng `asyncHandler` bọc lại, lỗi tự chuyển về `errorHandler`. |
| **Validate ở biên** | Dữ liệu vào được zod kiểm tra ở middleware. Service tin dữ liệu đã sạch. |
| **Không lặp code** | Phân trang, định dạng response, `select` user đều là hàm hoặc hằng dùng chung. |
| **Không hard-code** | Cấu hình đọc từ `config/env.js`, không rải `process.env` khắp nơi. |
| **Đặt tên nhất quán** | File: `<tên>.service.js`, `<tên>.controller.js`, `<tên>.route.js`, `<tên>.validation.js`. |

---

# PHẦN A — BACKEND

## Giai đoạn 1: Nền backend

**Mục tiêu:** dựng bộ khung dùng chung để các giai đoạn sau chỉ việc viết nghiệp vụ. Chưa có API nghiệp vụ nào.

**Nhánh:** `feature/backend-foundation`

**File tạo mới:**

```
src/
├── config/env.js                       Đọc và kiểm tra biến môi trường một lần duy nhất
├── utils/ApiError.js                   Class lỗi có kèm statusCode
├── utils/asyncHandler.js               Bọc controller async, tự bắt lỗi
├── utils/response.js                   ok() và created(), trả đúng định dạng chung
├── utils/pagination.js                 Đổi page/limit thành skip/take, tính totalPages
├── middlewares/validate.middleware.js  Chạy schema zod trên body/params/query
├── middlewares/error.middleware.js     notFoundHandler và errorHandler
├── validations/common.validation.js    Schema phân trang và schema id trên URL
└── routes/index.js                     Gom toàn bộ route con
```

**Nội dung chính:**

- `ApiError`: có `statusCode` và `message`. Thêm các hàm tạo nhanh: `ApiError.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`.
- `errorHandler`: nhận mọi lỗi và quy về định dạng chung. Xử lý riêng 3 loại:
  - `ApiError` → dùng `statusCode` của nó
  - Lỗi zod → `400` kèm danh sách field sai
  - Lỗi Prisma `P2002` (trùng unique) → `409`
  - Còn lại → `500`, và **chỉ hiện stack trace khi không phải môi trường production**
- `validate(schema)`: middleware nhận schema zod, kiểm tra xong thì **ghi lại dữ liệu đã chuẩn hoá** vào `req`, ví dụ `page` từ chuỗi `"2"` thành số `2`.
- `env.js`: đọc toàn bộ biến môi trường, thiếu biến bắt buộc thì **dừng server ngay khi khởi động** kèm thông báo rõ ràng. Tốt hơn nhiều so với việc chạy được rồi lỗi lúc có request.

**Sửa `app.js`:** thêm `express.json()`, cấu hình CORS theo `CORS_ORIGIN`, gắn `routes/index.js` vào `/api`, và đặt `notFoundHandler` cùng `errorHandler` **ở cuối cùng** (thứ tự này quan trọng, đặt sai thì middleware lỗi không chạy).

**Cách test:**
- `GET /api/health` → `200`
- `GET /api/khong-ton-tai` → `404` đúng định dạng chung
- Tạm thêm một route ném lỗi để kiểm tra `errorHandler`, test xong thì xoá

**Hoàn thành khi:** gọi một đường dẫn sai trả về JSON đúng định dạng, không phải trang HTML lỗi của Express.

**Commit:** `feat(backend): them nen tang response, error handler va validate`

---

## Giai đoạn 2: Xác thực và tài khoản

**Mục tiêu:** đăng ký, đăng nhập, và cơ chế bảo vệ API bằng JWT.

**Nhánh:** `feature/auth`

**File tạo mới:**

```
src/
├── utils/jwt.js                      signToken() và verifyToken()
├── constants/select.js               userPublicSelect, dùng để không lộ mật khẩu
├── middlewares/auth.middleware.js    protect() và optionalAuth()
├── validations/auth.validation.js
├── validations/user.validation.js
├── services/auth.service.js
├── services/user.service.js
├── controllers/auth.controller.js
├── controllers/user.controller.js
├── routes/auth.route.js
└── routes/user.route.js
```

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | 🔓 |
| POST | `/api/auth/login` | 🔓 |
| GET | `/api/users/me` | 🔒 |
| PUT | `/api/users/me` | 🔒 (chỉ họ tên và tuổi, avatar để giai đoạn 3) |

**Nội dung chính:**

- **Đăng ký:** chuẩn hoá email về chữ thường và cắt khoảng trắng → kiểm tra email đã tồn tại chưa → `bcrypt.hash(password, 10)` → tạo user → trả về user kèm token luôn, để frontend không phải gọi đăng nhập thêm một lần.
- **Đăng nhập:** tìm user theo email → `bcrypt.compare` → trả token.
  - ⚠️ **Sai email và sai mật khẩu phải trả về cùng một thông báo** (`Email hoặc mật khẩu không đúng`). Nếu phân biệt hai trường hợp, kẻ tấn công sẽ dò được email nào có trong hệ thống.
- **`protect()`**: đọc header `Authorization: Bearer <token>` → `verifyToken` → truy vấn user → gán `req.user`.
  - Phải truy vấn DB chứ không chỉ tin payload trong token, vì user có thể đã bị xoá sau khi token được phát.
  - Token sai hoặc hết hạn → `401` với thông báo tiếng Việt rõ ràng, không để lộ lỗi gốc của thư viện.
- **`optionalAuth()`**: có token thì gán `req.user`, không có thì cho qua. Dùng cho các API public nhưng cần biết user là ai nếu đã đăng nhập.
- **Validate:** email đúng dạng, mật khẩu tối thiểu 6 ký tự, họ tên không rỗng, tuổi là số nguyên từ 1 đến 150.

**Cách test:** đăng ký → lấy token → gọi `GET /users/me` kèm token. Kiểm tra thêm: không gửi token → `401`, token sai → `401`, đăng ký trùng email → `409`, và **response không có trường `password`**.

**Hoàn thành khi:** đăng ký, đăng nhập, và xem được thông tin cá nhân bằng token.

**Commit:** `feat(auth): them api dang ky, dang nhap va middleware jwt`

---

## Giai đoạn 3: Upload ảnh lên Cloudinary

**Mục tiêu:** đăng ảnh, xoá ảnh, đổi avatar.

**Nhánh:** `feature/image-upload`

> 📌 **Việc cần làm trước:** tạo tài khoản tại [cloudinary.com](https://cloudinary.com) (gói free đủ dùng), vào Dashboard lấy `Cloud name`, `API Key`, `API Secret` rồi điền vào `backend/.env`. Hiện ba biến này đang là giá trị mẫu.

**File tạo mới:**

```
src/
├── config/cloudinary.js               Khởi tạo SDK
├── middlewares/upload.middleware.js   multer memoryStorage, lọc loại file, giới hạn 5MB
├── services/cloudinary.service.js     uploadImage() và deleteImage()
├── services/image.service.js
├── validations/image.validation.js
├── controllers/image.controller.js
└── routes/image.route.js
```

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/images` | 🔒 |
| DELETE | `/api/images/:id` | 🔒 |
| PUT | `/api/users/me` | 🔒 (bổ sung phần avatar) |

**Nội dung chính:**

- **multer:** dùng `memoryStorage` (giữ file trong RAM rồi đẩy thẳng lên Cloudinary, không ghi ra ổ đĩa). Chỉ nhận `jpeg`, `png`, `webp`, `gif`. Giới hạn 5MB.
- **`uploadImage()`**: nhận buffer, upload vào folder `capstone/images` hoặc `capstone/avatars`, trả về `{ url, publicId, width, height }`.
- **POST /images:** upload lên Cloudinary trước → lưu DB sau.
  - ⚠️ Nếu lưu DB thất bại thì **phải xoá file vừa upload trên Cloudinary**, nếu không sẽ để lại file rác không ai tham chiếu tới.
- **DELETE /images/:id:** tìm ảnh → không có thì `404` → `image.userId !== req.user.id` thì **`403`** → xoá bản ghi (bình luận và lượt lưu tự xoá theo cascade) → xoá file trên Cloudinary.
- **PUT /users/me:** có file avatar mới thì upload, cập nhật DB, rồi **xoá avatar cũ** dựa vào `avatarPublicId`.
- **Xử lý lỗi multer:** file quá lớn hoặc sai loại phải trả `400` với thông báo tiếng Việt, không để lộ lỗi gốc `LIMIT_FILE_SIZE`.

**Cách test:** trong Postman chọn `Body` → `form-data`, key `image` kiểu File. Kiểm tra: upload thành công, upload file 10MB → `400`, upload file `.pdf` → `400`, dùng token của user A xoá ảnh của user B → **`403`**, xoá ảnh xong kiểm tra file đã mất trên Cloudinary.

**Hoàn thành khi:** đăng được ảnh, ảnh hiện trên Cloudinary, và người khác không xoá được ảnh của mình.

**Commit:** `feat(image): them api upload va xoa anh voi cloudinary`

---

## Giai đoạn 4: Xem và tìm kiếm ảnh

**Mục tiêu:** ba API đọc của trang chủ và trang chi tiết.

**Nhánh:** `feature/image-read`

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/images?page=&limit=` | 🔓 |
| GET | `/api/images/search?name=&page=&limit=` | 🔓 |
| GET | `/api/images/:id` | 🔓 |

**Nội dung chính:**

- **Phân trang:** dùng `prisma.$transaction` chạy đồng thời `findMany` và `count`, để hai số liệu chắc chắn khớp nhau. Sắp xếp `createdAt` giảm dần.
- **Tìm kiếm:** `where: { name: { contains: keyword } }`. Không cần `mode: "insensitive"` vì collation của DB đã bỏ qua hoa thường và dấu (xem [DECISIONS.md](DECISIONS.md)).
- **Chi tiết ảnh:** `include` thông tin người tạo nhưng **phải kèm `select: userPublicSelect`**, nếu `include` trần thì mật khẩu của người tạo sẽ bị trả ra ngoài. Đây là lỗi rất dễ mắc.
- **Thêm số lượng bình luận và lượt lưu** bằng `_count`, để frontend hiển thị mà không phải gọi thêm API.
- ⚠️ **Thứ tự route quan trọng:** `/images/search` phải khai báo **trước** `/images/:id`. Nếu ngược lại, Express sẽ hiểu `search` là một `:id` và ném lỗi.

**Cách test:** upload vài ảnh → `GET /images?page=1&limit=2` xem phân trang có đúng → tìm bằng chữ thường và chữ có dấu → `GET /images/999999` phải trả `404` → **kiểm tra response không có trường `password` của người tạo**.

**Hoàn thành khi:** trang chủ và trang chi tiết có đủ dữ liệu cần thiết.

**Commit:** `feat(image): them api danh sach, tim kiem va chi tiet anh`

---

## Giai đoạn 5: Bình luận

**Mục tiêu:** xem và thêm bình luận.

**Nhánh:** `feature/comment`

**File tạo mới:** `comment.service.js`, `comment.controller.js`, `comment.validation.js`. Route gắn vào `image.route.js` vì cùng tiền tố `/images/:id`.

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/images/:id/comments` | 🔓 |
| POST | `/api/images/:id/comments` | 🔒 |

**Nội dung chính:**

- **GET:** kiểm tra ảnh tồn tại trước, nếu không thì `404` (khác với việc trả mảng rỗng, vì hai trường hợp này mang ý nghĩa khác nhau). Kèm thông tin người bình luận qua `userPublicSelect`. Sắp xếp mới nhất trước. Có phân trang.
- **POST:** `userId` **lấy từ `req.user.id`**, không nhận từ body. Nội dung từ 1 đến 1000 ký tự, cắt khoảng trắng hai đầu, không cho bình luận rỗng. Trả `201` kèm bình luận vừa tạo và thông tin người bình luận, để frontend hiển thị ngay mà không cần gọi lại API danh sách.

**Cách test:** thêm bình luận → xem danh sách → thử gửi `{ "userId": 999 }` trong body để **xác nhận server bỏ qua nó và vẫn dùng id từ token** → bình luận vào ảnh không tồn tại phải trả `404` → không có token phải trả `401`.

**Hoàn thành khi:** thêm và xem được bình luận, và không thể mạo danh user khác.

**Commit:** `feat(comment): them api xem va tao binh luan`

---

## Giai đoạn 6: Lưu và bỏ lưu ảnh

**Mục tiêu:** nút Save hoạt động đầy đủ.

**Nhánh:** `feature/save-image`

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/images/:id/saved` | 🔒 |
| POST | `/api/images/:id/save` | 🔒 |
| DELETE | `/api/images/:id/save` | 🔒 |

**Nội dung chính:**

- **GET:** trả `{ saved: true/false }`. Dùng `findUnique` với khoá chính ghép `{ userId_imageId: { userId, imageId } }`.
- **POST:** dùng **`upsert`** thay vì `create`. Nhờ vậy lưu lại một ảnh đã lưu vẫn trả `200` chứ không lỗi trùng khoá chính.
- **DELETE:** dùng `deleteMany` thay vì `delete`. `deleteMany` không ném lỗi khi không có bản ghi nào khớp, nên bỏ lưu một ảnh chưa lưu vẫn trả `200`.
- Cả hai API đều **idempotent**: gọi bao nhiêu lần cũng cho cùng kết quả. Frontend nhờ đó không cần xử lý trường hợp bấm nút hai lần.

**Cách test:** lưu → kiểm tra `saved: true` → lưu lại lần nữa phải vẫn `200` → bỏ lưu → `saved: false` → bỏ lưu lần nữa vẫn `200`.

**Hoàn thành khi:** lưu và bỏ lưu chạy đúng, gọi trùng không sinh lỗi.

**Commit:** `feat(save): them api luu, bo luu va kiem tra da luu anh`

---

## Giai đoạn 7: Trang quản lý ảnh

**Mục tiêu:** hai danh sách của trang quản lý.

**Nhánh:** `feature/user-images`

**API làm được:**

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/users/me/created-images` | 🔒 |
| GET | `/api/users/me/saved-images` | 🔒 |

**Nội dung chính:**

- **Ảnh đã tạo:** lọc `where: { userId: req.user.id }`.
- **Ảnh đã lưu:** truy vấn bảng `luu_anh` rồi `include` ảnh. Sắp xếp theo `savedAt` giảm dần, tức là ảnh lưu gần nhất lên đầu, **không phải** theo ngày tạo ảnh.
  - Nhớ `map` kết quả về đúng dạng danh sách ảnh giống các API khác, để frontend dùng chung một component.
- Dùng lại `utils/pagination.js`, **không viết lại logic phân trang**.

**Cách test:** tạo 2 user, mỗi user đăng ảnh và lưu ảnh khác nhau, rồi kiểm tra mỗi user chỉ thấy đúng dữ liệu của mình.

**Hoàn thành khi:** hai danh sách trả đúng dữ liệu theo token.

**Commit:** `feat(user): them api danh sach anh da tao va da luu`

---

## Giai đoạn 8: Hoàn thiện backend

**Mục tiêu:** dữ liệu mẫu, tài liệu, và rà soát trước khi chuyển sang frontend.

**Nhánh:** `feature/backend-polish`

**Việc cần làm:**

1. **Script tạo dữ liệu mẫu** `prisma/seed.js`: tạo khoảng 3 user và 20 ảnh dùng URL ảnh online (ví dụ `picsum.photos`), kèm bình luận và lượt lưu. Khai báo lệnh `db:seed` trong `package.json`. Có dữ liệu mẫu thì làm frontend nhanh hơn nhiều, và người khác clone repo về cũng chạy thử được ngay.
2. **Export Postman collection:** tổ chức theo thư mục từng nhóm API. Dùng biến `{{baseUrl}}` và `{{token}}`. Ở request đăng nhập, thêm script ở tab `Tests` để **tự lưu token vào biến**, đỡ phải copy thủ công. Lưu file vào `doc/postman/`.
3. **Viết `README.md`:** mô tả dự án, tech stack, hướng dẫn chạy từng bước (docker → env → migrate → seed → dev), bảng danh sách API, và link tới `doc/`. Đây là thứ giảng viên đọc **đầu tiên**.
4. **Rà soát bảo mật** theo danh sách dưới đây.

### Danh sách rà soát bảo mật

- [ ] Không API nào trả về trường `password`
- [ ] Mọi API 🔒 đều có `protect`, thiếu token trả `401`
- [ ] Không API nào nhận `userId` từ body hoặc params khi đã có token
- [ ] Xoá ảnh của người khác trả `403`
- [ ] `.env` không bị commit, `.env.example` đã đầy đủ biến
- [ ] `JWT_SECRET` là chuỗi dài ngẫu nhiên, không phải giá trị mẫu
- [ ] Lỗi `500` không trả stack trace khi ở môi trường production

**Commit:** `chore(backend): them seed data, postman collection va readme`

---

# PHẦN B — FRONTEND

> Đề bài **chỉ bắt buộc backend**. Phần này là điểm cộng. Nếu thời gian gấp, hãy ưu tiên hoàn thành phần A, rồi deploy, sau đó mới làm frontend.

## Giai đoạn 9: Nền frontend

**Nhánh:** `feature/frontend-setup`

```
src/
├── api/axiosClient.js       instance axios, interceptor tự gắn token
├── api/authApi.js, imageApi.js, userApi.js
├── context/AuthContext.jsx  lưu user và token
├── components/ProtectedRoute.jsx
├── layouts/MainLayout.jsx   header, thanh tìm kiếm, nút đăng nhập
└── App.jsx                  khai báo router
```

- Cài và cấu hình **Tailwind CSS**.
- **Interceptor request:** tự gắn `Authorization: Bearer <token>`.
- **Interceptor response:** gặp `401` thì xoá token và chuyển về trang đăng nhập.
- `AuthContext`: khôi phục trạng thái đăng nhập từ `localStorage` khi tải lại trang.

**Commit:** `feat(frontend): setup tailwind, router, axios va auth context`

---

## Giai đoạn 10: Đăng ký và đăng nhập

**Nhánh:** `feature/frontend-auth`

- Trang đăng ký và đăng nhập, dùng chung một component form.
- Hiện lỗi trả về từ API ngay dưới từng field.
- Đăng nhập xong lưu token và chuyển về trang chủ.
- `ProtectedRoute` chặn các trang cần đăng nhập.

**Commit:** `feat(frontend): them trang dang ky va dang nhap`

---

## Giai đoạn 11: Trang chủ và chi tiết ảnh

**Nhánh:** `feature/frontend-home`

- **Lưới masonry** dùng `columns` của CSS. Đặt sẵn tỉ lệ khung ảnh bằng `chieu_rong` và `chieu_cao` để lưới không bị nhảy khi ảnh đang tải.
- **Cuộn vô hạn** bằng `IntersectionObserver`.
- **Tìm kiếm** có debounce khoảng 400ms, tránh gọi API mỗi lần gõ một chữ.
- **Trang chi tiết** (dạng modal hoặc trang riêng): ảnh lớn, thông tin người tạo, nút Save, danh sách bình luận, ô nhập bình luận.
- Nút Save: cập nhật giao diện ngay rồi mới gọi API (optimistic update), thất bại thì trả về trạng thái cũ.
- Có trạng thái đang tải (skeleton) và trạng thái danh sách rỗng.

**Commit:** `feat(frontend): them trang chu va chi tiet anh`

---

## Giai đoạn 12: Quản lý ảnh và thông tin cá nhân

**Nhánh:** `feature/frontend-profile`

- Trang quản lý: 2 tab **Đã tạo** và **Đã lưu**.
- Xoá ảnh, có hộp thoại xác nhận trước khi xoá.
- Trang thêm ảnh: chọn file, **xem trước ảnh**, nhập tên và mô tả, có thanh tiến trình khi upload.
- Trang sửa thông tin cá nhân: họ tên, tuổi, avatar.

**Commit:** `feat(frontend): them trang quan ly anh va thong tin ca nhan`

---

# PHẦN C — DEPLOY

## Giai đoạn 13: Deploy

**Nhánh:** `feature/deploy`

**Thứ tự thực hiện:**

1. **MySQL trên Railway** → lấy `DATABASE_URL`
2. **Backend lên Railway:** khai báo biến môi trường, đặt lệnh build `npm install` (script `postinstall` sẽ tự chạy `prisma generate`) và lệnh chạy `npm run db:deploy && npm start`
   - ⚠️ Kiểm tra nền tảng đang dùng **Node 22.18 trở lên**, vì Prisma 7 sinh ra file TypeScript và cần tính năng type stripping của Node (xem [DECISIONS.md](DECISIONS.md))
3. **Frontend lên Vercel:** đặt `VITE_API_URL` trỏ tới backend đã deploy
4. **Cập nhật `CORS_ORIGIN`** của backend thành domain Vercel
5. **Chạy seed** trên DB production để có dữ liệu demo
6. **Cập nhật README** với link demo và link API

**Commit:** `chore: cau hinh deploy va cap nhat readme`

---

# Tổng hợp

| GĐ | Nội dung | Số API | Ưu tiên |
|---|---|---|---|
| 1 | Nền backend | 0 | 🔴 Bắt buộc |
| 2 | Xác thực và tài khoản | 4 | 🔴 Bắt buộc |
| 3 | Upload ảnh | 2 | 🔴 Bắt buộc |
| 4 | Xem và tìm kiếm ảnh | 3 | 🔴 Bắt buộc |
| 5 | Bình luận | 2 | 🔴 Bắt buộc |
| 6 | Lưu ảnh | 3 | 🔴 Bắt buộc |
| 7 | Trang quản lý | 2 | 🔴 Bắt buộc |
| 8 | Hoàn thiện backend | — | 🔴 Bắt buộc (đề yêu cầu Postman) |
| 9–12 | Frontend | — | 🟡 Điểm cộng |
| 13 | Deploy | — | 🟡 Nên có |

**Tổng 16 API**, khớp với danh sách trong [DECISIONS.md](DECISIONS.md).

Mỗi giai đoạn nên đi kèm một Pull Request trên GitHub, kể cả khi bạn tự merge. Lịch sử có PR nhìn chuyên nghiệp hơn nhiều so với commit thẳng vào `main`.

---

## Phần mở rộng (chỉ làm khi đã xong hết phần bắt buộc)

Xoá bình luận của chính mình · Đổi mật khẩu · Refresh token · Trang hồ sơ public của user khác · Tài liệu Swagger · Tag hoặc danh mục cho ảnh · Rate limit cho API đăng nhập
