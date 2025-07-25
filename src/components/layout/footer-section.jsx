import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function FooterSection() {
  return (
    <footer className="bg-black text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

        <div>
         <Link href="/"> <img
            src="https://react.woth.gr/wp-content/uploads/2021/09/logo_simple_white.png"
            alt="FunPromotion Logo"
            width={220}
            height={54}
          /></Link>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-1" />
              <a
                href="https://www.google.com/maps/place/Fun+Promotion+%CE%95%CF%84%CE%B1%CE%B9%CF%81%CE%B9%CE%BA%CE%AC+%CE%B4%CF%8E%CF%81%CE%B1/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                10 Palestinis Street, Alimos
              </a>
            </li>
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-1" />
              <a
                href="https://www.google.com/maps/place/Fun+Promotion+-+%CE%94%CE%B9%CE%B1%CF%86%CE%B7%CE%BC%CE%B9%CF%83%CF%84%CE%B9%CE%BA%CE%AC+%CE%94%CF%8E%CF%81%CE%B1/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                85 Filadelfias Street, Acharnes
              </a>
            </li>
            <li className="flex items-start gap-2">
              <FiPhone />
              <a href="tel:2102207424" className="hover:underline">210 220 7424</a>
            </li>
            <li className="flex items-start gap-2">
              <FiMail />
              <a href="mailto:sales@fun-promotion.gr" className="hover:underline">sales@fun-promotion.gr</a>
            </li>
          </ul>
          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a
              href="https://www.facebook.com/FunPromotion.gr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="border border-white p-2 rounded-full hover:bg-white hover:text-black transition"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/funpromotion_gr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="border border-white p-2 rounded-full hover:bg-white hover:text-black transition"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/funpromotion/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="border border-white p-2 rounded-full hover:bg-white hover:text-black transition"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Recent News */}
        <div>
          <h5 className="text-lg font-semibold mb-4">RECENT NEWS</h5>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <a href="https://react.woth.gr/grafiki-uli/" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://react.woth.gr/wp-content/uploads/2024/05/3-Simple-Steps-to-an-Eco-Friendly-Workplace-75x60.jpg"
                  alt="Eco Workplace – Stationery at its best."
                  width={75}
                  height={60}
                  className="rounded object-cover"
                />
              </a>
              <div>
                <a href="https://react.woth.gr/grafiki-uli/" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  Eco Workplace – Stationery at its best.
                </a>
                <p className="text-xs">May 24, 2022</p>
              </div>
            </li>
            <li className="flex gap-4">
              <a href="https://react.woth.gr/diafimistika-eidi/" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://react.woth.gr/wp-content/uploads/2024/05/mo9727-16-ambiant-75x60.jpg"
                  alt="Promotional items for catering establishments"
                  width={75}
                  height={60}
                  className="rounded object-cover"
                />
              </a>
              <div>
                <a href="https://react.woth.gr/diafimistika-eidi/" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  Promotional items for catering establishments
                </a>
                <p className="text-xs">May 10, 2022</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Useful */}
        <div>
          <h5 className="text-lg font-semibold mb-4">USEFUL</h5>
          <ul className="space-y-2">
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">News</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Company</a></li>
            <li><a href="https://react.woth.gr/katalogoi" className="hover:underline">Catalogs</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Communication</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Career opportunities</a></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h5 className="text-lg font-semibold mb-4">ACCOUNT</h5>
          <ul className="space-y-2">
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Wishlist</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Control panel</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Account details</a></li>
          </ul>
        </div>

        {/* Terms */}
        <div>
          <h5 className="text-lg font-semibold mb-4">TERMS OF USE</h5>
          <ul className="space-y-2">
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Terms of use</a></li>
            <li><a href="https://react.woth.gr/epikoinonia" className="hover:underline">Privacy policy</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-black text-center py-4 text-sm border-t border-gray-800">
        <small>
          <strong>FUNPROMOTION</strong> &copy; 2025. ALL RIGHTS RESERVED.
        </small>
      </div>
    </footer>
  );
} 