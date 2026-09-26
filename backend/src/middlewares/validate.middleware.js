import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

// Nhận một object schema dạng { body?, params?, query? }, chạy zod trên từng
// phần tương ứng của req, rồi GHI LẠI dữ liệu đã chuẩn hoá vào req.
// Nhờ vậy controller/service nhận được dữ liệu đã đúng kiểu (page là number
// chứ không phải chuỗi "2"), không phải tự ép kiểu lại.
//
// Lưu ý Express 5: req.query chỉ có getter, gán trực tiếp (req.query = ...)
// sẽ ném lỗi "Cannot set property query ... which has only a getter".
// Phải dùng Object.defineProperty để ghi đè lại thuộc tính này.
export const validate = (schemas) => (req, res, next) => {
  try {
    for (const key of ["body", "params", "query"]) {
      const schema = schemas[key];
      if (!schema) continue;
      const parsed = schema.parse(req[key]);
      Object.defineProperty(req, key, { value: parsed, writable: true, configurable: true });
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(ApiError.badRequest("Dữ liệu không hợp lệ", details));
    }
    next(err);
  }
};

export default validate;
