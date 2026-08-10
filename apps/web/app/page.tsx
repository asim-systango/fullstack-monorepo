import { redirect } from 'next/navigation';

/**
 * Root page — / pe aate hi login pe bhej do.
 *
 * `redirect()` Next.js ka server-side function hai.
 * Matlab browser ko HTML milne se pehle hi redirect ho jaata hai.
 * Client pe koi JavaScript nahi bhejta — fast aur clean.
 */
export default function RootPage() {
  redirect('/login');
}
