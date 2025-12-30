import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { CasperProvider } from '@/lib/casper-context';

const font = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CasperID - Decentralized Identity Verification',
  description: 'Secure, decentralized identity verification on the Casper blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <CasperProvider>{children}</CasperProvider>
      </body>
    </html>
  );
}
