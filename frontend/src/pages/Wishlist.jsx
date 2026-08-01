import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Wishlist = () => {
  const { wishlistItems, loading, toggleWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { showToast } = useContext(ToastContext);

  const handleAddToCart = async (product) => {
    if (product.stockQuantity <= 0) {
      showToast('Product is currently out of stock.', 'warning');
      return;
    }
    try {
      await addToCart(product._id, 1);
      showToast(`Added ${product.name} to cart!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      await toggleWishlist(productId);
      showToast(`Removed ${name} from wishlist.`, 'success');
    } catch (err) {
      showToast('Failed to remove item.', 'error');
    }
  };

  if (loading) return <LoadingSpinner fullScreen={true} />;

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart size={38} fill="currentColor" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 m-0">Your Wishlist is Empty</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Keep track of fresh organic groceries you love by adding them to your wishlist.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all shadow-md"
        >
          Explore Groceries
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <h1 className="text-3xl font-extrabold text-slate-800 m-0">Your Wishlist</h1>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm divide-y divide-slate-100">
          {wishlistItems.map((product) => {
            const price = (product.discountPrice && product.discountPrice > 0) ? product.discountPrice : product.price;
            const image = product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
            const hasDiscount = product.discountPrice != null && product.discountPrice > 0 && product.discountPrice < product.price;

            return (
              <div key={product._id} className="flex flex-col sm:flex-row items-center gap-4 py-4 first:pt-0 last:pb-0">
                {/* Image */}
                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                  <img src={image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <Link to={`/products/${product._id}`} className="font-bold text-slate-800 hover:text-emerald-700 text-sm line-clamp-2">
                    {product.name}
                  </Link>
                  <div className="text-xs text-slate-400 font-semibold uppercase">{product.category}</div>
                  
                  {/* Stock tag */}
                  <div className="text-xs font-semibold">
                    {product.stockQuantity > 0 ? (
                      <span className="text-emerald-600">In Stock</span>
                    ) : (
                      <span className="text-rose-500 font-bold">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-center sm:text-right shrink-0">
                  {hasDiscount ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 line-through">₹{product.price.toFixed(2)}</span>
                      <span className="text-sm font-extrabold text-slate-800">₹{product.discountPrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-extrabold text-slate-800">₹{product.price.toFixed(2)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 justify-between w-full sm:w-auto pt-2 sm:pt-0">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stockQuantity <= 0}
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product._id, product.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
