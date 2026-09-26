import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const axiosClient = axios.create({ baseURL });

// Tự gắn "Authorization: Bearer <token>" cho mọi request nếu đã đăng nhập.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap response về đúng envelope { statusCode, message, data } mà backend
// trả, và chuẩn hoá lỗi để nơi gọi chỉ cần đọc err.message / err.details.
axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      // Không tự điều hướng ở đây (module này không có quyền truy cập
      // router). Bắn sự kiện để AuthContext lắng nghe và tự đăng xuất.
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const message =
      err.response?.data?.message ||
      (err.code === "ERR_NETWORK"
        ? "Không kết nối được tới máy chủ. Kiểm tra lại backend đã chạy chưa."
        : "Đã có lỗi xảy ra, vui lòng thử lại");

    return Promise.reject({
      status: err.response?.status,
      message,
      details: err.response?.data?.details,
    });
  },
);

export default axiosClient;
