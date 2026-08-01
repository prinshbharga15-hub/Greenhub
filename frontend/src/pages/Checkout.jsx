import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Truck, MapPin, CheckCircle, CreditCard, ChevronLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Checkout = () => {
  const { cartItems, subtotal, discount, deliveryFee, total, clearCart, coupon, loading: cartLoading } = useContext(CartContext);
  const { user, loading: authLoading } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Online Payment States
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD', 'Card', or 'UPI'
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      showToast('Please login to complete checkout.', 'warning');
      navigate('/login?redirect=checkout');
      return;
    }

    if (!cartLoading) {
      if (cartItems.length === 0) {
        showToast('Your cart is empty.', 'warning');
        navigate('/cart');
        return;
      }
    }

    // Pre-populate address info
    setFullName(user.name || '');
    setAddress(user.address || '');
    setPhone(user.phone || '');
  }, [user, authLoading, cartItems, cartLoading, showToast, navigate]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !address.trim() || !city.trim() || !zip.trim() || !phone.trim()) {
      showToast('All shipping address fields are required.', 'warning');
      return;
    }

    if (paymentMethod === 'Card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length !== 16 || isNaN(cleanCard)) {
        showToast('Please enter a valid 16-digit card number.', 'warning');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.trim().length < 5) {
        showToast('Please enter expiry date in MM/YY format.', 'warning');
        return;
      }
      const cleanCvv = cardCvv.trim();
      if (cleanCvv.length !== 3 || isNaN(cleanCvv)) {
        showToast('Please enter a valid 3-digit CVV.', 'warning');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g., name@okaxis).', 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      const shippingAddress = {
        fullName: fullName.trim(),
        address: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
        phone: phone.trim()
      };

      const res = await api.post('/api/orders', {
        shippingAddress,
        couponCode: coupon?.code || '',
        paymentMethod
      });

      showToast('Order placed successfully!', 'success');
      // Clear local context cart state
      clearCart();
      navigate('/dashboard/orders');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to place order. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 text-sm font-semibold">
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-800 m-0">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 m-0 border-b border-slate-100 pb-4">
                <MapPin size={20} className="text-emerald-600" />
                Shipping & Delivery Address
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs font-semibold text-slate-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">Recipient Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 55501928"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-slate-400 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main St, Apt 4"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Springfield"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="e.g. 98001"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      required
                    />
                  </div>
                </div>

                <hr className="my-6 border-slate-100" />

                 {/* Payment Method section */}
                 <div className="space-y-4">
                   <h3 className="font-bold text-slate-800 text-sm mb-1">Payment Method</h3>
                   <div className="grid grid-cols-3 gap-3">
                     <button
                       type="button"
                       onClick={() => setPaymentMethod('COD')}
                       className={`p-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                         paymentMethod === 'COD'
                           ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-sm'
                           : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       <Truck size={18} />
                       <span>COD</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setPaymentMethod('Card')}
                       className={`p-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                         paymentMethod === 'Card'
                           ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-sm'
                           : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       <CreditCard size={18} />
                       <span>Card Payment</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => setPaymentMethod('UPI')}
                       className={`p-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                         paymentMethod === 'UPI'
                           ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 shadow-sm'
                           : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                       }`}
                     >
                       <CheckCircle size={18} />
                       <span>UPI</span>
                     </button>
                   </div>

                   {paymentMethod === 'COD' && (
                     <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-[10px] text-slate-500 font-medium">
                       Pay in cash or UPI directly to the delivery agent upon receiving your order.
                     </div>
                   )}

                   {paymentMethod === 'Card' && (
                     <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 animate-fade-in">
                       <div>
                         <label className="block text-[10px] uppercase text-slate-400 mb-1">Card Number *</label>
                         <input
                           type="text"
                           maxLength="19"
                           value={cardNumber}
                           onChange={(e) => {
                             const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                             const matches = val.match(/\d{4,16}/g);
                             const match = (matches && matches[0]) || '';
                             const parts = [];
                             for (let i = 0, len = match.length; i < len; i += 4) {
                               parts.push(match.substring(i, i + 4));
                             }
                             if (parts.length > 0) {
                               setCardNumber(parts.join(' '));
                             } else {
                               setCardNumber(val);
                             }
                           }}
                           placeholder="xxxx xxxx xxxx xxxx"
                           className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800 font-semibold text-xs"
                           required={paymentMethod === 'Card'}
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <label className="block text-[10px] uppercase text-slate-400 mb-1">Expiry Date *</label>
                           <input
                             type="text"
                             maxLength="5"
                             value={cardExpiry}
                             onChange={(e) => {
                               let val = e.target.value.replace(/[^0-9]/g, '');
                               if (val.length >= 2) {
                                 val = val.substring(0, 2) + '/' + val.substring(2, 4);
                               }
                               setCardExpiry(val);
                             }}
                             placeholder="MM/YY"
                             className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800 font-semibold text-xs"
                             required={paymentMethod === 'Card'}
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] uppercase text-slate-400 mb-1">CVV *</label>
                           <input
                             type="password"
                             maxLength="3"
                             value={cardCvv}
                             onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                             placeholder="***"
                             className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800 font-semibold text-xs"
                             required={paymentMethod === 'Card'}
                           />
                         </div>
                       </div>
                     </div>
                   )}

                   {paymentMethod === 'UPI' && (
                     <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-2 animate-fade-in">
                       <div>
                         <label className="block text-[10px] uppercase text-slate-400 mb-1">UPI ID *</label>
                         <input
                           type="text"
                           value={upiId}
                           onChange={(e) => setUpiId(e.target.value)}
                           placeholder="e.g. john@okaxis"
                           className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-slate-800 font-semibold text-xs"
                           required={paymentMethod === 'UPI'}
                         />
                       </div>
                     </div>
                   )}
                 </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Order Summary Basket */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 m-0 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBag size={18} className="text-emerald-600" />
                Items Summary ({cartItems.length})
              </h2>

              {/* Mini Item List */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const price = (item.product.discountPrice && item.product.discountPrice > 0) ? item.product.discountPrice : item.product.price;
                  return (
                    <div key={item.productId} className="flex justify-between py-2 text-xs font-semibold text-slate-700">
                      <span className="line-clamp-1 max-w-[160px]">{item.product.name} <span className="text-slate-400">x{item.quantity}</span></span>
                      <span>₹{(price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <hr className="border-slate-100" />

              {/* Summary Calculations */}
              <div className="space-y-3 font-semibold text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-700">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-slate-700">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-sm font-extrabold text-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
