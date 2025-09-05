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
      <body className="antialiased" suppressHydrationWarning={true}>
        <Providers>
          <Header />
          <Navbar />
          {children}
          <FooterSection />
        </Providers>
      </body>
    </html>
  );
}
