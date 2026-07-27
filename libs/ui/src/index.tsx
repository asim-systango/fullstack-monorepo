import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

const baseBtn: CSSProperties = {
  fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
  fontSize: 14,
  fontWeight: 500,
  padding: '8px 14px',
  borderRadius: 6,
  border: '1px solid #8d8d8d',
  background: '#161616',
  color: '#f4f4f4',
  cursor: 'pointer',
};

const ghostBtn: CSSProperties = {
  ...baseBtn,
  background: 'transparent',
  color: '#161616',
  borderColor: '#8d8d8d',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  style,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      style={{ ...(variant === 'ghost' ? ghostBtn : baseBtn), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

const cardStyle: CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  padding: 16,
  background: '#ffffff',
};

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#525252',
  marginBottom: 4,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #8d8d8d',
  fontSize: 14,
  fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
};

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={inputStyle} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }} {...props} />
  );
}

export function StatusMessage({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'error' | 'success';
  children: ReactNode;
}) {
  const toneColors: Record<'neutral' | 'error' | 'success', string> = {
    error: '#da1e28',
    success: '#198038',
    neutral: '#525252',
  };
  return (
    <p style={{ color: toneColors[tone], fontSize: 14, margin: '8px 0' }}>{children}</p>
  );
}
