import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { AppProviders } from '@/components/providers';
import '../styles/globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Project management — boards, issues, and team workflows',
};

/** SSR splash so hard refresh shows the brand spinner before JS hydrates. */
function BootSplashMarkup() {
  return (
    <output id="tf-boot-splash" className="tf-boot-overlay" aria-busy="true">
      <div className="tf-brand-splash">
        <div className="tf-brand-loader tf-brand-loader-lg">
          <div className="tf-brand-loader-orb">
            <svg
              className="tf-brand-loader-svg"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="5"
              />
              <g className="tf-brand-loader-spin">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="90 250"
                />
                <circle cx="64" cy="10" r="5" fill="currentColor" />
              </g>
              <rect x="40" y="40" width="48" height="48" rx="14" fill="#0f172a" />
              <text
                x="64"
                y="70"
                textAnchor="middle"
                className="tf-brand-loader-mark"
                fontSize="22"
                fontWeight="700"
                fill="#f8fafc"
              >
                Tf
              </text>
            </svg>
          </div>
          <p className="tf-brand-loader-label">Loading TaskFlow…</p>
        </div>
      </div>
    </output>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <BootSplashMarkup />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
