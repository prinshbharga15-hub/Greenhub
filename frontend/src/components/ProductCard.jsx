import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { ToastContext } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { showToast } = useContext(ToastContext);

  const { _id, name, price, discountPrice, stockQuantity, images, category, rating, reviewsCount } = product;

  const isFavorite = isInWishlist(_id);
  const image = images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300';
  const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice > 0 && discountPrice < price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (stockQuantity <= 0) return;
    try {
      await addToCart(_id, 1);
      showToast(`Added ${name} to cart!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    try {
      const action = await toggleWishlist(_id);
      showToast(
        action === 'added' ? `Added ${name} to wishlist!` : `Removed ${name} from wishlist.`,
        'success'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-emerald-100 p-4 transition-all duration-300 relative flex flex-col justify-between group">
      
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full z-10 shadow-sm animate-pulse">
          Save {Math.round(((price - discountPrice) / price) * 100)}%
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-4 right-4 p-2 bg-white/95 border border-slate-100 rounded-full shadow-md z-10 transition-transform active:scale-90 ${
          isFavorite ? 'text-rose-500 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'
        }`}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${_id}`} className="block overflow-hidden rounded-xl bg-slate-50 relative aspect-square mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white text-sm font-bold bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md mb-2 inline-block">
            {category}
          </span>
          {/* Product Name */}
          <Link to={`/products/${_id}`} className="block text-slate-800 font-bold hover:text-emerald-700 text-base line-clamp-2 leading-snug mb-1">
            {name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-slate-700">{rating || '5.0'}</span>
            <span className="text-[10px] text-slate-400 font-medium">({reviewsCount || 0})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-slate-400 line-through">₹{price.toFixed(2)}</span>
                <span className="text-lg font-extrabold text-slate-800">₹{discountPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-extrabold text-slate-800">₹{price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={stockQuantity <= 0}
            className={`p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center shadow-md ${
              stockQuantity <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
