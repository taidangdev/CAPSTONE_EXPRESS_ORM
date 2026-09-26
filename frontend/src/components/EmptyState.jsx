export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <Icon size={26} />
        </div>
      )}
      <p className="text-base font-semibold text-neutral-800">{title}</p>
      {description && <p className="max-w-sm text-sm text-neutral-500">{description}</p>}
      {action}
    </div>
  );
}
