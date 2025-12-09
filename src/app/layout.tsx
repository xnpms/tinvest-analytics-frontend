import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const robotoFlex = localFont({
  src: [
    {
      path: '../../public/fonts/RobotoFlex.woff2',
      weight: '400 700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-robotoFlex',
});

export const metadata: Metadata = {
  title: 'Tinvest Analytics',
  description: 'Платформа для анализа инвестиций',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${robotoFlex.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
