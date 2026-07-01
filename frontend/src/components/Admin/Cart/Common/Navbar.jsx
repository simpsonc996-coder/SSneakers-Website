import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from "react-icons/hi2";
import SearchBar from './SearchBar';
import CartDrawer from './Layout/CartDrawer';
import { IoMdClose } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../../../../redux/slices/cartSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const {cart} = useSelector((state) => state.cart);
  const {user, guestId} = useSelector((state) => state.auth);

  // Sync cart with backend on load and whenever the logged-in user changes
  useEffect(() => {
    const userId = user?._id || null;
    dispatch(fetchCart({ userId, guestId }));
  }, [dispatch, user?._id, guestId]);

  const cartItemCount = cart?.products?.reduce((total, product) => total + product.quantity, 0) || 0;

  const toggleNavDrawer = () => {
      setNavDrawerOpen(!navDrawerOpen);
   }

  const toggleCartDrawer = () => {
      setDrawerOpen(!drawerOpen);
   }
    
  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left - Logo */}
        <div>
          <Link to="/" className="text-2xl font-medium">
            SSneakers
          </Link>
        </div>
        {/* Center - Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/collections/all"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Shop
          </Link>
          <Link
            to="/profile"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Sell
          </Link>
          <Link
            to="/login"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Authentication
          </Link>
          <Link
            to="/collections/all?sortBy=popularity"
            className="text-gray-700 hover:text-black text-sm font-medium uppercase"
          >
            Trending
          </Link>
        </div>
        {/* Right - Search and User Icons */}
        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-black px-2 rounded text-sm text-white"
            >
              Admin
            </Link>
          )}
          <Link to="/profile" className="hover:text-black">
            <HiOutlineUser className="h-6 w-6 text-gray-700" />
          </Link>
          <button
            onClick={toggleCartDrawer}
            className="relative hover:text-black"
          >
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-ssneakers-red text-white text-xs rounded-full px-2 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>
          {/* Search - new things to learn here */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>
          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>
      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/2 h-full bg-white shadow-lg transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            <Link
              to="/collections/all"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Shop
            </Link>
            <Link
              to="/profile"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Sell
            </Link>
            <Link
              to="/login"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Authentication
            </Link>
            <Link
              to="/collections/all?sortBy=popularity"
              onClick={toggleNavDrawer}
              className="block text-gray-600 hover:text-black"
            >
              Trending
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar