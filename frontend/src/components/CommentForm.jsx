import { useState } from "react";
import { Send } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

export default function CommentForm({ onSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || pending) return;

    setPending(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Avatar user={user} size={36} />
      <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 focus-within:border-brand-400">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          maxLength={1000}
          className="flex-1 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="text-brand-600 disabled:text-neutral-300"
          aria-label="Gửi bình luận"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
