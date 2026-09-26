import { Link } from "react-router-dom";
import { MessageCircle, Bookmark } from "lucide-react";

export default function ImageCard({ image, action }) {
  return (
    <div className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-2xl bg-neutral-100 shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/images/${image.id}`}>
        <img
          src={image.url}
          alt={image.name}
          width={image.width || undefined}
          height={image.height || undefined}
          loading="lazy"
          className="h-auto w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/65 via-black/0 to-black/0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="line-clamp-2 text-sm font-medium text-white">{image.name}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/85">
            <span className="flex items-center gap-1">
              <MessageCircle size={14} /> {image.commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark size={14} /> {image.savedCount}
            </span>
          </div>
        </div>
      </Link>

      {action && <div className="absolute top-2 right-2 z-10">{action}</div>}
    </div>
  );
}
