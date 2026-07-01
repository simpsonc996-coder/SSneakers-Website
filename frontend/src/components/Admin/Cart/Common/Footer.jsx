import React from "react";
import { Link } from "react-router";
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io5";
import { RiTwitterXLine } from "react-icons/ri";
import { FiPhoneCall } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-8">
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Newsletter</h3>
          <p className="text-gray-500 mb-4">
            Be the first to hear about our new products, exclusive events, and
            online offers!
          </p>
          <p className="font-medium text-sm text-gray-600 mb-6">Sign up and get 10% off on your first order!</p>

          {/* Newsletter form */}
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 text-sm border-t border-l border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all flex-1"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop links */}
        <div>
            <h3 className="text-lg text-gray-800 mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-600">
                <li>
              <Link to="/collections/all" className="hover:text-gray-500 transition-colors">All Sneakers</Link>
                </li>
                <li>
              <Link to="/collections/all?sortBy=newest" className="hover:text-gray-600 transition-colors">New Arrivals</Link>
                </li>
                <li>
              <Link to="/collections/all?sortBy=popularity" className="hover:text-gray-600 transition-colors">Trending Sneakers</Link>
                </li>
                <li>
              <Link to="/collections/all" className="hover:text-gray-600 transition-colors">Limited Drops</Link>
                </li>
            </ul>
        </div>
        {/* Support links */}
        <div>
            <h3 className="text-lg text-gray-800 mb-4">Support</h3>
            <ul className="space-y-2 text-gray-600">
                <li>
                    <Link to="/" className="hover:text-gray-500 transition-colors">Contact Us</Link>
                </li>
                <li>
                    <Link to="/" className="hover:text-gray-600 transition-colors">About Us</Link>
                </li>
                <li>
                    <Link to="/" className="hover:text-gray-600 transition-colors">FAQs</Link>
                </li>
                <li>
                    <Link to="/" className="hover:text-gray-600 transition-colors">Features</Link>
                </li>
            </ul>
        </div>
        {/* Follow us section */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Follow Us</h3>
          <div className="flex items-center space-x-4 mb-6">
            <a href="https://www.facebook.com" className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <TbBrandMeta className="h-5 w-5"/>
            </a>
            <a href="https://www.instagram.com" className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <IoLogoInstagram className="h-5 w-5"/>
            </a>
            <a href="https://www.x.com" className="hover:text-gray-300 transition-colors" target="_blank" rel="noopener noreferrer">
              <RiTwitterXLine className="h-4 w-4"/>
            </a>
          </div>
          <p className="text-gray-500">Call Us</p>
          <p>
            <FiPhoneCall className="inline-block mr-2"/>
            0825816414
          </p>
        </div>
      </div>
      {/* Footer bottom */}
      <div className="container mx-auto mt-12 px-4 lg:px-8 border-t border-gray-200 pt-6">
        <p className="text-gray-500 text-sm tracking-tighter text-center">
          &copy; {new Date().getFullYear()},Designed and developed by Coinneach Simpson.
        </p>
      </div>
    </footer>
  );
};

export default Footer;