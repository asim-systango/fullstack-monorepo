export function AdminEmptyState({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <div className="admin-empty">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
