const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

const UNITS = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

// Trả về "3 giờ trước", "2 ngày trước"... Dùng Intl có sẵn của trình duyệt,
// không cần thêm thư viện ngày tháng.
export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);

  for (const { unit, seconds } of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "Vừa xong";
}
