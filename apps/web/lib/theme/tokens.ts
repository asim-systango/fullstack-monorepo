/**
 * Programmatic LinkedIn theme tokens (mirrors styles/theme.css @theme).
 * Use for JS/inline styles; prefer Tailwind utilities in components.
 */
export const linkedInTheme = {
  colors: {
    brand: '#0A66C2',
    brandHover: '#004182',
    brandPressed: '#002E60',
    brandSoft: '#E8F3FF',
    brandMuted: '#70B5F9',
    canvas: '#F4F2EE',
    surface: '#FFFFFF',
    surfaceHover: '#F3F2EF',
    border: '#E0DFDC',
    borderStrong: '#CFCFCF',
    primary: '#191919',
    secondary: '#666666',
    tertiary: '#8C8C8C',
    inverse: '#FFFFFF',
    link: '#0A66C2',
    success: '#057642',
    warning: '#915907',
    danger: '#CC1016',
  },
  fontFamily: {
    sans: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  radius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    pill: '9999px',
  },
  layout: {
    feedMaxWidth: 1128,
    navHeight: 52,
  },
} as const;

export type LinkedInTheme = typeof linkedInTheme;
