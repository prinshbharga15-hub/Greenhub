import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, Leaf, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartCount, total } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-700 font-sans tracking-tight">
              <Leaf className="w-8 h-8 text-emerald-600 fill-emerald-100" />
              <span>Green<span className="text-emerald-500 font-medium">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search fresh groceries, organic produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all bg-emerald-50/20"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-emerald-600 hover:text-emerald-700">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link to="/" className={`hover:text-emerald-600 transition-colors ${isActive('/') ? 'text-emerald-600 font-bold' : ''}`}>Home</Link>
            <Link to="/products" className={`hover:text-emerald-600 transition-colors ${isActive('/products') ? 'text-emerald-600 font-bold' : ''}`}>Shop</Link>
            <Link to="/about" className={`hover:text-emerald-600 transition-colors ${isActive('/about') ? 'text-emerald-600 font-bold' : ''}`}>About</Link>
            <Link to="/contact" className={`hover:text-emerald-600 transition-colors ${isActive('/contact') ? 'text-emerald-600 font-bold' : ''}`}>Contact</Link>
            <Link to="/faq" className={`hover:text-emerald-600 transition-colors ${isActive('/faq') ? 'text-emerald-600 font-bold' : ''}`}>FAQ</Link>
          </div>

          {/* User Icons and Actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all">
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all flex items-center gap-1.5">
              <div className="relative">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              {total > 0 && (
                <span className="text-sm font-semibold text-emerald-700">${total.toFixed(2)}</span>
              )}
            </Link>

            {/* User Profile dropdown */}
            <div ref={dropdownRef} className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold transition-all focus:outline-none"
                  >
                    <User size={18} className="text-emerald-600" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-emerald-600" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      {isAdmin && (
                        <Link
                          to="/AdminDeshbord"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold"
                        >
                          <LayoutDashboard size={16} className="text-emerald-600" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <User size={16} className="text-emerald-600" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/dashboard?tab=orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <ShoppingBag size={16} className="text-emerald-600" />
                        Order History
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link to="/login" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5">
                    Sign In
                  </Link>
                  <Link to="/register" className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full transition-all shadow-sm">
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburguer Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Mobile Cart Link */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-full">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-emerald-600 rounded-full focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-50 bg-white px-4 py-4 space-y-4 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
            />
            <button type="submit" className="absolute right-3 top-2 text-emerald-600">
              <Search size={18} />
            </button>
          </form>

          <div className="flex flex-col gap-3 font-semibold text-gray-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">Shop</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">About Us</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">Contact</Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">FAQ</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-emerald-600 py-1.5 border-b border-gray-50">Wishlist ({wishlistItems.length})</Link>
          </div>

          <div className="pt-2">
            {user ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-emerald-800">Welcome, {user.name}</div>
                {isAdmin && (
                  <Link
                    to="/AdminDeshbord"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-sm font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 rounded-xl"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-sm font-semibold bg-gray-50 text-gray-700 py-2 rounded-xl"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full bg-rose-50 text-rose-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
