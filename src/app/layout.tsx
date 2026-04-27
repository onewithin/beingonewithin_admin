import type { Metadata } from "next";
import "./globals.css";
import { Rubik } from 'next/font/google';
import { Toaster } from 'sonner'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-rubik',
})

export const metadata: Metadata = {
  title: "BeingOneWithin — Admin",
  description: "Admin panel for managing the BeingOneWithin meditation app — content, users, onboarding, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
