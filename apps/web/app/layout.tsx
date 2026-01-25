import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pen & Paper Games',
  description: 'Classic pen and paper games reimagined for the digital age',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
