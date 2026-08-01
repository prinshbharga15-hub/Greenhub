import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Eye, CheckCircle, ShieldCheck, Smartphone } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDashboard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state read from URL (?tab=...)
  const activeTab = searchParams.get('tab') || 'dashboard';

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile Edit fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=dashboard');
    } else {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, navigate]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (activeTab === 'dashboard' || activeTab === 'orders')) {
      fetchOrders();
    }
  }, [user, activeTab, fetchOrders]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setSelectedOrder(null);
  };

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome header banner */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white m-0">Hello, {user.name}!</h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm font-medium">Welcome to your dashboard. Manage your orders and edit your profile address details.</p>
          </div>
          <div className="shrink-0 relative z-10 flex gap-2">
            <span className="bg-emerald-800 border border-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 uppercase">
              {user.role} Account
            </span>
          </div>
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-800/40 rounded-full blur-3xl"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Side: Sidebar navigation Tabs */}
          <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
            <button
              onClick={() => changeTab('dashboard')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
              }`}
            >
              <User size={16} />
              Account Summary
            </button>
            <button
              onClick={() => changeTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
              }`}
            >
              <ShoppingBag size={16} />
              My Orders ({orders.length})
            </button>
            <button
              onClick={() => changeTab('profile')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
              }`}
            >
              <MapPin size={16} />
              Edit Profile Info
            </button>
          </aside>

          {/* Right Side: Tab Contents panel */}
          <div className="lg:col-span-3">
            
            {/* T1: Dashboard Overview tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase">Total Placed Orders</span>
                      <h3 className="text-3xl font-extrabold text-slate-800 m-0">{orders.length}</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag size={24} /></div>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase">Registered Email</span>
                      <h4 className="text-sm font-extrabold text-slate-800 m-0 truncate max-w-[200px]">{user.email}</h4>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><User size={24} /></div>
                  </div>
                </div>

                {/* Shipping summary cards */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800 m-0 pb-3 border-b border-slate-100">Primary Shipping Address</h3>
                  <div className="space-y-3 font-semibold text-xs text-slate-600">
                    <div className="flex gap-2.5 items-start">
                      <User size={16} className="text-emerald-600 shrink-0" />
                      <span>{user.name}</span>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <Smartphone size={16} className="text-emerald-600 shrink-0" />
                      <span>{user.phone || 'No phone number registered'}</span>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <MapPin size={16} className="text-emerald-600 shrink-0" />
                      <span className="leading-relaxed">{user.address || 'No shipping address registered'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T2: Order History tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {ordersLoading ? (
                  <LoadingSpinner />
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <ShoppingBag size={38} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-800 text-base mb-1">No Orders Placed</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-4">You haven't ordered any fresh items yet.</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold text-xs shadow-md"
                    >
                      Shop Now
                    </button>
                  </div>
                ) : selectedOrder ? (
                  /* Single Order details sub-panel */
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-xs font-bold text-emerald-700 hover:underline mb-1 flex items-center gap-1"
                        >
                          &larr; Back to Order List
                        </button>
                        <h3 className="font-bold text-slate-800 text-sm m-0">Order details: #{selectedOrder._id}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        selectedOrder.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        selectedOrder.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>

                    {/* Shipping info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold text-slate-500">
                      <div>
                        <h4 className="font-bold text-slate-700 mb-1.5">Shipping Address</h4>
                        <p className="text-slate-800">{selectedOrder.shippingAddress?.fullName}</p>
                        <p className="text-slate-600">{selectedOrder.shippingAddress?.phone}</p>
                        <p className="text-slate-600">{selectedOrder.shippingAddress?.address}</p>
                        <p className="text-slate-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.zip}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 mb-1.5">Payment Method</h4>
                        <p className="text-slate-800">
                          {selectedOrder.paymentMethod === 'Card' ? 'Online Card Payment' :
                           selectedOrder.paymentMethod === 'UPI' ? 'Online UPI Payment' :
                           'Cash on Delivery (COD)'}
                        </p>
                        <p className="text-slate-500 font-medium mt-1">Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Item lines */}
                    <div>
                      <h4 className="font-bold text-slate-700 text-xs mb-3">Ordered Groceries</h4>
                      <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.productId} className="flex justify-between items-center py-3 text-xs font-semibold text-slate-700">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border" />
                              )}
                              <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                            </div>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals summary */}
                    <div className="flex justify-end pt-2">
                      <div className="w-64 space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="text-slate-800">₹{(selectedOrder.subtotal || selectedOrder.totalAmount).toFixed(2)}</span>
                        </div>
                        {selectedOrder.discountAmount > 0 && (
                          <div className="flex justify-between text-rose-600">
                            <span>Discount ({selectedOrder.couponCode})</span>
                            <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <hr className="border-slate-100" />
                        <div className="flex justify-between text-sm font-extrabold text-slate-800">
                          <span>Total Amount</span>
                          <span className="text-emerald-700">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Order list view */
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b text-slate-400 uppercase font-bold">
                          <th className="py-3 px-2">Product & Order</th>
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Total Amount</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-3">
                                {order.items?.[0]?.image ? (
                                  <img src={order.items[0].image} alt={order.items[0].name} className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-slate-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                                    📦
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-800 text-xs block line-clamp-1">
                                    {order.items?.[0]?.name || 'Grocery Order'}
                                    {order.items?.length > 1 && <span className="text-emerald-600 font-semibold text-[10px] ml-1">+{order.items.length - 1} more</span>}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">#{order._id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-3.5 px-2 text-slate-800 font-extrabold">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ml-auto"
                              >
                                <Eye size={12} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* T3: Edit Profile Info tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 m-0 pb-4 border-b border-slate-100">Update Profile Details</h3>
                
                <form onSubmit={handleProfileSubmit} className="space-y-4 pt-4 text-xs font-semibold text-slate-500">
                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block uppercase text-slate-400 mb-1.5">Registered Email (Read-only)</label>
                    <input
                      type="email"
                      value={user.email}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed font-medium text-sm"
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase text-slate-400 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 555-019-283"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block uppercase text-slate-400 mb-1.5">Shipping Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 100 Main St, Springfield"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
