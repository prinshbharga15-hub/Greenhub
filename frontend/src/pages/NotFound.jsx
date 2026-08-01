import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Store, ChevronLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Animated 404 block */}
        <div className="relative flex justify-center">
          <div className="text-9xl font-extrabold text-emerald-100 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-16 h-16 text-emerald-600 fill-emerald-50 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-800 m-0">Oops! Page Not Found</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been moved, deleted, or simply didn't exist in our garden.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Store size={14} /> Back to Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Browse Shop
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
