import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TDAP Food Directory - Pakistani Food Companies",
  description: "Official directory of Pakistani food companies registered with Trade Development Authority of Pakistan (TDAP). Discover exporters, manufacturers, and suppliers in the food sector.",
  keywords: "TDAP, Pakistan food export, food companies Pakistan, rice exporters, spices exporters, food directory",
  authors: [{ name: "Trade Development Authority of Pakistan" }],
  openGraph: {
    title: "TDAP Food Directory",
    description: "Official directory of Pakistani food companies",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
