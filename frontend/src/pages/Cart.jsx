import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Ticket, Plus, Minus, Store } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const {
    cartItems,
    loading,
    coupon,
    couponError,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    deliveryFee,
    total
  } = useContext(CartContext);

  const { showToast } = useContext(ToastContext);
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      showToast(`Coupon ${couponCode.trim().toUpperCase()} applied successfully!`, 'success');
      setCouponCode('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleQtyChange = async (productId, currentQty, delta, stockLimit) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    if (newQty > stockLimit) {
      showToast('Requested quantity exceeds stock availability.', 'warning');
      return;
    }
    try {
      await updateQuantity(productId, newQty);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveItem = async (productId, name) => {
    try {
      await removeFromCart(productId);
      showToast(`Removed ${name} from cart.`, 'success');
    } catch (err) {
      showToast('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      showToast('Cart cleared.', 'success');
    } catch (err) {
      showToast('Failed to clear cart.', 'error');
    }
  };

  if (loading) return <LoadingSpinner fullScreen={true} />;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={38} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 m-0">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Looks like you haven't added any fresh groceries to your cart yet. Let's explore our organic garden!
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all shadow-md shadow-emerald-100"
        >
          <Store size={18} />
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <h1 className="text-3xl font-extrabold text-slate-800 m-0">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm divide-y divide-slate-100">
              {cartItems.map((item) => {
                const price = (item.product.discountPrice && item.product.discountPrice > 0) ? item.product.discountPrice : item.product.price;
                const image = item.product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
                
                return (
                  <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 py-4 first:pt-0 last:pb-0">
                    {/* Image */}
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-grow text-center sm:text-left space-y-1">
                      <Link to={`/products/${item.productId}`} className="font-bold text-slate-800 hover:text-emerald-700 text-sm line-clamp-2">
                        {item.product.name}
                      </Link>
                      <div className="text-xs text-slate-400 font-semibold uppercase">{item.product.category}</div>
                      <div className="text-sm font-extrabold text-emerald-600">₹{price.toFixed(2)}</div>
                    </div>

                    {/* Quantity Adjustment */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity, -1, item.product.stockQuantity)}
                        className="p-1 hover:bg-white text-slate-500 hover:text-emerald-600 rounded-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity, 1, item.product.stockQuantity)}
                        className="p-1 hover:bg-white text-slate-500 hover:text-emerald-600 rounded-lg"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal & Delete Actions */}
                    <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400 font-semibold uppercase">Total</div>
                        <div className="text-sm font-extrabold text-slate-800">₹{(price * item.quantity).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId, item.product.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-3 py-1.5"
              >
                Empty Cart
              </button>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Coupon Code Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Ticket size={18} className="text-emerald-600" />
                Promo Code
              </h3>

              {coupon ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block">Applied Coupon:</span>
                    <span className="text-sm font-extrabold text-emerald-700">{coupon.code}</span>
                    <span className="text-[10px] text-emerald-600 block font-semibold mt-0.5">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off subtotal` : `₹${coupon.discountValue} discount`}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. GREEN20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-bold uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && <span className="text-[10px] text-rose-500 font-semibold block">{couponError}</span>}
            </div>

            {/* Calculations Receipt */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Order Summary</h3>

              <div className="space-y-3 font-semibold text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-slate-800">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-base font-extrabold text-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 hover:shadow-emerald-100 transition-all active:scale-95"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
