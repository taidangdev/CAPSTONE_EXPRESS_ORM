// Script tạo dữ liệu mẫu để dev/test frontend nhanh mà không cần tự tay đăng
// ký, đăng nhập, đăng ảnh trước. Chạy: npm run db:seed (trong thư mục backend/).
//
// Chạy lại nhiều lần AN TOÀN: script tự xoá các user mẫu cũ (nhận diện qua
// domain email @seed.local) trước khi tạo lại từ đầu. Ảnh, bình luận, lượt
// lưu của các user này tự xoá theo (ON DELETE CASCADE trong schema.prisma).
import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

const SEED_PASSWORD = "password123";

const SEED_USERS = [
  { email: "an@seed.local", fullName: "Nguyễn Văn An", age: 24 },
  { email: "binh@seed.local", fullName: "Trần Thị Bình", age: 27 },
  { email: "chi@seed.local", fullName: "Lê Minh Chi", age: 22 },
];

const IMAGE_TOPICS = [
  "Hoàng hôn trên biển",
  "Con mèo lười",
  "Ly cà phê buổi sáng",
  "Núi rừng Tây Bắc",
  "Đường phố Hà Nội về đêm",
  "Hoa anh đào mùa xuân",
  "Chú chó Golden Retriever",
  "Bãi biển Nha Trang",
  "Món phở bò truyền thống",
  "Cầu Vàng Đà Nẵng",
  "Ruộng bậc thang Sa Pa",
  "Chợ nổi miền Tây",
  "Thác nước Bản Giốc",
  "Vịnh Hạ Long",
  "Phố cổ Hội An",
  "Cánh đồng hoa hướng dương",
  "Chùa Một Cột",
  "Xe đạp bên hồ",
  "Ly trà sữa trân châu",
  "Bầu trời đêm đầy sao",
];

// Kích thước xen kẽ (khổ ngang/dọc) để lưới masonry ở frontend có nhiều tỉ lệ
// khác nhau, giống dữ liệu thật hơn là toàn ảnh cùng một kích thước.
const SIZES = [
  { width: 800, height: 600 },
  { width: 600, height: 800 },
  { width: 800, height: 1000 },
  { width: 1000, height: 667 },
];

const COMMENT_TEXTS = [
  "Đẹp quá!",
  "Chụp ở đâu vậy bạn?",
  "Mê cái này luôn",
  "Màu sắc hài hoà ghê",
  "Cho mình xin info với",
];

async function main() {
  console.log("Đang xoá dữ liệu mẫu cũ (nếu có)...");
  await prisma.user.deleteMany({ where: { email: { in: SEED_USERS.map((u) => u.email) } } });

  console.log("Đang tạo user mẫu...");
  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = [];
  for (const u of SEED_USERS) {
    users.push(await prisma.user.create({ data: { ...u, password: hashedPassword } }));
  }

  console.log("Đang tạo ảnh mẫu...");
  const images = [];
  for (let i = 0; i < IMAGE_TOPICS.length; i++) {
    const owner = users[i % users.length];
    const size = SIZES[i % SIZES.length];
    const seedKey = `capstone-seed-${i + 1}`;
    images.push(
      await prisma.image.create({
        data: {
          name: IMAGE_TOPICS[i],
          description: `Ảnh mẫu: ${IMAGE_TOPICS[i]}`,
          url: `https://picsum.photos/seed/${seedKey}/${size.width}/${size.height}`,
          // publicId giả — ảnh mẫu không thật sự tồn tại trên Cloudinary, nên
          // publicId này không khớp file nào. Xoá ảnh mẫu qua API vẫn chạy
          // bình thường: cloudinary.uploader.destroy() trả "not found" chứ
          // không ném lỗi (đã kiểm tra thực tế, xem doc/DECISIONS.md).
          publicId: `seed/${seedKey}`,
          width: size.width,
          height: size.height,
          userId: owner.id,
        },
      }),
    );
  }

  console.log("Đang tạo bình luận mẫu...");
  let commentCount = 0;
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    // Chỉ user KHÁC chủ ảnh mới bình luận, giống hành vi thật.
    const commenters = users.filter((u) => u.id !== image.userId);
    const numComments = i % 3; // 0, 1, 2, 0, 1, 2, ...
    for (let j = 0; j < numComments; j++) {
      await prisma.comment.create({
        data: {
          imageId: image.id,
          userId: commenters[j % commenters.length].id,
          content: COMMENT_TEXTS[commentCount % COMMENT_TEXTS.length],
        },
      });
      commentCount++;
    }
  }

  console.log("Đang tạo lượt lưu mẫu...");
  let saveCount = 0;
  for (let i = 0; i < images.length; i++) {
    // Cứ 2 ảnh thì có 1 ảnh được lưu, để danh sách "đã lưu" không rỗng nhưng
    // cũng không phải toàn bộ ảnh đều được lưu.
    if (i % 2 !== 0) continue;
    const image = images[i];
    const savers = users.filter((u) => u.id !== image.userId);
    await prisma.savedImage.create({
      data: { userId: savers[saveCount % savers.length].id, imageId: image.id },
    });
    saveCount++;
  }

  console.log("\nHoàn tất! Dữ liệu mẫu:");
  console.log(`  - ${users.length} user, mật khẩu chung: "${SEED_PASSWORD}"`);
  users.forEach((u) => console.log(`    + ${u.email}`));
  console.log(`  - ${images.length} ảnh, ${commentCount} bình luận, ${saveCount} lượt lưu`);
}

main()
  .catch((err) => {
    console.error("Seed thất bại:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
