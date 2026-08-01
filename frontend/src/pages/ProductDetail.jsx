import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, CornerDownLeft, Plus, Minus, MessageSquarePlus } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { showToast } = useContext(ToastContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data || null);
    } catch (err) {
      console.error('Error loading product details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen={true} />;
  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h3 className="font-extrabold text-slate-800 text-lg mb-2">Product Not Found</h3>
        <p className="text-slate-500 font-medium text-sm mb-6">The product you are looking for might have been removed or doesn't exist.</p>
        <Link to="/products" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold">Back to Store</Link>
      </div>
    );
  }

  const { name, description, price, discountPrice, stockQuantity, images, category, rating, reviewsCount, reviews = [] } = product;
  const isFavorite = isInWishlist(product._id);
  const image = images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
  const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice > 0 && discountPrice < price;
  const activePrice = hasDiscount ? discountPrice : price;

  const handleAddToCart = async () => {
    if (stockQuantity <= 0) return;
    try {
      await addToCart(product._id, quantity);
      showToast(`Added ${quantity} ${name} to cart!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const action = await toggleWishlist(product._id);
      showToast(
        action === 'added' ? `Added ${name} to wishlist!` : `Removed ${name} from wishlist.`,
        'success'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review.', 'warning');
      return;
    }
    if (!newComment.trim()) {
      showToast('Review comment cannot be empty.', 'warning');
      return;
    }

    setReviewLoading(true);
    try {
      await api.post('/api/reviews', {
        productId: product._id,
        rating: newRating,
        comment: newComment.trim()
      });
      showToast('Review submitted successfully!', 'success');
      setNewComment('');
      // Refresh page details to show new review
      fetchProductDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit review.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Back Link */}
        <Link to="/products" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 text-sm font-semibold">
          <CornerDownLeft size={16} /> Back to Products
        </Link>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Product Images */}
          <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
            <img src={image} alt={name} className="w-full h-full object-cover" />
            {stockQuantity <= 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                <span className="text-white font-bold bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full text-base">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md inline-block">
                {category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 m-0">{name}</h1>
              
              {/* Ratings and reviews counts */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={16}
                      fill={index < Math.round(rating || 5) ? 'currentColor' : 'none'}
                      className={index < Math.round(rating || 5) ? 'text-amber-400' : 'text-slate-200'}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700">{rating || '5.0'}</span>
                <span className="text-xs text-slate-400 font-semibold">({reviewsCount || 0} customer reviews)</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Price tag */}
            <div className="space-y-1">
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">₹{discountPrice.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-slate-400 line-through">₹{price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">₹{price.toFixed(2)}</span>
              )}
              <div className="text-xs text-slate-500 font-semibold">
                Availability: {stockQuantity > 0 ? (
                  <span className="text-emerald-600 font-bold">In Stock ({stockQuantity} units left)</span>
                ) : (
                  <span className="text-rose-500 font-bold">Temporarily Unavailable</span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed font-medium">{description}</p>

            <hr className="border-slate-100" />

            {/* Quantity Selector & Actions */}
            {stockQuantity > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Quantity input */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1.5 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-white text-slate-600 hover:text-emerald-700 rounded-lg transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="p-1 hover:bg-white text-slate-600 hover:text-emerald-700 rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 shadow-emerald-100"
                >
                  <ShoppingBag size={18} />
                  Add to Cart - ₹{(activePrice * quantity).toFixed(2)}
                </button>

                {/* Toggle Favorite Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3.5 border rounded-xl shadow-sm transition-all active:scale-95 shrink-0 ${
                    isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            )}

            {/* Key trust badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-600" />
                <span>Next-day home delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>100% Quality organic farm-picked</span>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
            Ratings & Customer Reviews ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Reviews Form */}
            <div className="lg:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <MessageSquarePlus size={16} className="text-emerald-600" />
                Write a Review
              </h3>
              
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Stars selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Rating</label>
                    <div className="flex text-amber-400 gap-1">
                      {Array.from({ length: 5 }, (_, i) => {
                        const starNum = i + 1;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNewRating(starNum)}
                            className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              fill={starNum <= newRating ? 'currentColor' : 'none'}
                              className={starNum <= newRating ? 'text-amber-400' : 'text-slate-300'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Feedback</label>
                    <textarea
                      rows="4"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts about this organic item..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 text-sm text-slate-500 font-medium">
                  Please{' '}
                  <Link to="/login" className="text-emerald-700 font-bold hover:underline">
                    sign in
                  </Link>{' '}
                  to leave a review.
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-sm font-semibold text-slate-400">
                  No reviews yet. Be the first to review this organic grocery product!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">{rev.userName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className={i < rev.rating ? 'text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>

                      <p className="text-slate-600 text-xs font-medium leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
