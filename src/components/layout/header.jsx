import React from 'react';
import { FiSearch, FiMail, FiPhone, FiUser, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Header() {
  return (
    <div className="   ">
      <div className="leading-6 font-semibold  bg-[#6B32C0] text-white text-center py-1 inter-style   ">
        €20 DISCOUNT FOR ONLINE ORDERS
      </div>

      <div className=" flex justify-between items-center bg-[#FF6600] px-5 py-2 text-white text-[12px] leading-[14px]">
        <div className="flex space-x-4 manrope-font ml-[30px] ">
          <a href="https://react.woth.gr/etaireia/" className="hover:underline manrope-font  ">COMPANY</a>
          <a href="https://react.woth.gr/blog/" className="hover:underline">NEWS</a>
          <a href="https://react.woth.gr/katalogoi/" className="hover:underline">CATALOGS</a>
          <a href="https://react.woth.gr/epikoinonia/" className="hover:underline ">COMMUNICATION</a>
        </div>
        <div className="flex space-x-3 text-lg inter-style  mr-[30px]">
          <a href="https://www.facebook.com/FunPromotion.gr/" className="hover:opacity-75" target="_blank"><FaFacebookF /></a>
          <a href="https://www.instagram.com/accounts/login/?next=https%3A%2F%2Fwww.instagram.com%2Ffunpromotion_gr%2F&is_from_rle" className="hover:opacity-75" target="_blank"><FaInstagram /></a>
          <a href="https://www.linkedin.com/company/funpromotion/" className="hover:opacity-75" target="_blank"><FaLinkedinIn /></a>
        </div>
      </div>
 
    </div>
  );
}
