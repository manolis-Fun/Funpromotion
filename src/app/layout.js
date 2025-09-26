import "./globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "@/components/layout/header";
import Navbar from "@/components/layout/navbar";
import FooterSection from "@/components/layout/footer-section";
import Providers from './Providers';

export const metadata = {
  title: "Fun Promotion - Promotional Gifts & Printing Services",
  description: "Since 2005, Fun Promotion has specialized in wholesale promotional gifts and printing services, serving customers throughout Greece, Cyprus and Thessaloniki.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning={true}>
        <Providers>
          <Header />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <FooterSection />
        </Providers>
      </body>
    </html>
  );
}
