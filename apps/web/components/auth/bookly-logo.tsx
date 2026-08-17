import Image from 'next/image';

export type BooklyLogoProps = Readonly<{
  variant?: 'full' | 'mark';
  className?: string;
  priority?: boolean;
}>;

const SIZES = {
  full: {
    width: 220,
    height: 72,
    src: '/brand/bookly-logo.png',
    alt: 'Bookly Library Management System',
  },
  mark: { width: 48, height: 48, src: '/brand/bookly-mark.png', alt: 'Bookly' },
} as const;

export function BooklyLogo({
  variant = 'full',
  className,
  priority = false,
}: BooklyLogoProps) {
  const size = SIZES[variant];
  return (
    <Image
      src={size.src}
      alt={size.alt}
      width={size.width}
      height={size.height}
      className={className}
      priority={priority}
    />
  );
}
