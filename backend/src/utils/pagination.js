// Đổi { page, limit } thành { skip, take } cho Prisma, và đóng gói kết quả
// phân trang theo cùng một dạng cho mọi API danh sách (xem D10 trong DECISIONS.md).

export const toSkipTake = ({ page, limit }) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const buildPageResult = ({ items, totalItems, page, limit }) => ({
  items,
  page,
  limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit)),
});

export default { toSkipTake, buildPageResult };
