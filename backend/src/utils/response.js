// Định dạng response thống nhất cho mọi API (xem doc/DECISIONS.md mục D8):
// { statusCode, message, data }

export const ok = (res, data = null, message = "Thành công", statusCode = 200) => {
  return res.status(statusCode).json({ statusCode, message, data });
};

export const created = (res, data = null, message = "Tạo mới thành công") => {
  return ok(res, data, message, 201);
};
