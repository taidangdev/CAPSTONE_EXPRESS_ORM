import { avatarColorFor, initialsFor } from "../utils/avatarColor";

export default function Avatar({ user, size = 40, className = "" }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${avatarColorFor(
        user?.fullName,
      )} ${className}`}
    >
      {initialsFor(user?.fullName)}
    </div>
  );
}
