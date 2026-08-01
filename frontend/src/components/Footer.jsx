import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/90 pt-16 pb-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
            <Leaf className="w-8 h-8 text-emerald-400 fill-emerald-950" />
            <span>Green<span className="text-emerald-400 font-medium">Hub</span></span>
          </Link>
          <p className="text-sm text-emerald-200/70 leading-relaxed">
            Your premium neighborhood destination for local, freshly-harvested organic vegetables, orchard-fresh fruits, artisan bakery goods, and high-quality grocery essentials. Delivers right to your doorstep.
          </p>
          <div className="flex gap-4.5 pt-2">
            <a href="#" className="p-2 bg-emerald-900/60 hover:bg-emerald-800 rounded-full transition-all text-emerald-300 hover:text-white">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="p-2 bg-emerald-900/60 hover:bg-emerald-800 rounded-full transition-all text-emerald-300 hover:text-white">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" className="p-2 bg-emerald-900/60 hover:bg-emerald-800 rounded-full transition-all text-emerald-300 hover:text-white">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        {/* Useful Quick Links */}
        <div>
          <h3 className="text-white font-bold text-base mb-6 border-l-2 border-emerald-400 pl-3">Explore GreenHub</h3>
          <ul className="space-y-3.5 text-sm font-medium">
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Fresh Grocery Shop</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Our Organic Story</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</Link></li>
            <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Free Account</Link></li>
          </ul>
        </div>

        {/* Categories Shortcut */}
        <div>
          <h3 className="text-white font-bold text-base mb-6 border-l-2 border-emerald-400 pl-3">Categories</h3>
          <ul className="space-y-3.5 text-sm font-medium">
            <li><Link to="/products?category=fruits" className="hover:text-emerald-400 transition-colors">Orchard Fruits</Link></li>
            <li><Link to="/products?category=vegetables" className="hover:text-emerald-400 transition-colors">Organic Vegetables</Link></li>
            <li><Link to="/products?category=dairy-eggs" className="hover:text-emerald-400 transition-colors">Dairy & Fresh Eggs</Link></li>
            <li><Link to="/products?category=bakery" className="hover:text-emerald-400 transition-colors">Artisanal Bakery</Link></li>
            <li><Link to="/products?category=beverages" className="hover:text-emerald-400 transition-colors">Cold Drinks & Beverages</Link></li>
          </ul>
        </div>

        {/* Contacts Info & Newsletter */}
        <div className="space-y-5">
          <h3 className="text-white font-bold text-base mb-6 border-l-2 border-emerald-400 pl-3">Get in Touch</h3>
          <ul className="space-y-4 text-sm font-medium text-emerald-200/80">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>100 Organic Ave, Green Garden City, GC 12345</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-400 shrink-0" />
              <span>+1 (555) 019-2834</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-400 shrink-0" />
              <span>support@greenhub.com</span>
            </li>
          </ul>
          
          <div className="pt-2">
            <h4 className="text-sm font-bold text-white mb-2.5">Subscribe to our newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-emerald-900 border-none text-white text-sm px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-emerald-300/40"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 rounded-r-lg transition-colors flex items-center justify-center">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-emerald-900/60 text-center text-xs text-emerald-200/50">
        <p>&copy; {new Date().getFullYear()} GreenHub Grocery E-Commerce. All rights reserved. Created with passion for fresh organic living.</p>
      </div>
    </footer>
  );
};

export default Footer;
