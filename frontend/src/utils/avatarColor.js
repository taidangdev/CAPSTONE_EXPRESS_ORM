// Sinh một màu nền ổn định (luôn ra cùng một màu cho cùng một tên) để làm
// avatar chữ cái đầu khi user chưa có ảnh đại diện.
const PALETTE = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

export function avatarColorFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] || "";
  return last.charAt(0).toUpperCase() || "?";
}
