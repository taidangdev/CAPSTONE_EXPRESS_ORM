// Danh sách field an toàn để trả về cho client khi truy vấn User.
// Dùng ở MỌI nơi có đụng tới bảng User (kể cả include quan hệ từ bảng khác),
// tuyệt đối không dùng "include: { user: true }" hay "SELECT *" trên User,
// vì sẽ lộ cột "password" ra ngoài.
export const userPublicSelect = {
  id: true,
  email: true,
  fullName: true,
  age: true,
  avatar: true,
  createdAt: true,
};

export default { userPublicSelect };
