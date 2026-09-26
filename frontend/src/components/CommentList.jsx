import Avatar from "./Avatar";
import { formatRelativeTime } from "../utils/formatDate";

export default function CommentList({ comments }) {
  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((c) => (
        <li key={c.id} className="flex items-start gap-3">
          <Avatar user={c.user} size={36} />
          <div>
            <p className="text-sm">
              <span className="font-semibold text-neutral-900">{c.user.fullName}</span>{" "}
              <span className="text-neutral-400">· {formatRelativeTime(c.createdAt)}</span>
            </p>
            <p className="mt-0.5 text-sm whitespace-pre-wrap text-neutral-700">{c.content}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
