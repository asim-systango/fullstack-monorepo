export function Avatar({ name }: Readonly<{ name: string }>) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'var(--tg-brand-soft)',
        color: 'var(--tg-brand-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
