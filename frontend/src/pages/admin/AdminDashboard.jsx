import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, Users, Plus, Edit, Trash2, Upload, RefreshCw, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view: overview, products, categories, orders, users
  const currentView = searchParams.get('view') || 'overview';

  // State managers
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', discountPrice: '', stockQuantity: '', category: '', images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', image: '' });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderUpdating, setOrderUpdating] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        showToast('Access denied. Administrator privileges required.', 'error');
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchViewData = useCallback(async () => {
    setLoading(true);
    try {
      if (currentView === 'overview') {
        const res = await api.get('/api/admin/dashboard');
        setDashboardData(res.data);
      } else if (currentView === 'products') {
        const [prodRes, catRes, dbRes] = await Promise.all([
          api.get('/api/products?limit=100'), // fetch all
          api.get('/api/categories'),
          api.get('/api/admin/dashboard')
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data || []);
        setDashboardData(dbRes.data);
      } else if (currentView === 'categories') {
        const res = await api.get('/api/categories');
        setCategories(res.data || []);
      } else if (currentView === 'orders') {
        const res = await api.get('/api/admin/orders');
        setOrders(res.data.orders || []);
      } else if (currentView === 'users') {
        const res = await api.get('/api/admin/users');
        setUsers(res.data.users || []);
      }
    } catch (err) {
      showToast('Error fetching dashboard records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentView, showToast]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchViewData();
    }
  }, [user, isAdmin, currentView, fetchViewData]);

  const handleViewChange = (viewName) => {
    setSearchParams({ view: viewName });
  };

  // --- PRODUCT CRUD HANDLERS ---

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must not exceed 5MB.', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/api/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imgBase = (import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') ? import.meta.env.VITE_API_BASE_URL : 'http://localhost:8000';
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, `${imgBase}${res.data.url}`]
      }));
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to upload image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description || !productForm.price || !productForm.category) {
      showToast('Fill in all required fields.', 'warning');
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity) || 0
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/api/products', payload);
        showToast('Product added successfully!', 'success');
      }

      setProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', discountPrice: '', stockQuantity: '', category: '', images: [] });
      fetchViewData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save product.', 'error');
    }
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      discountPrice: prod.discountPrice ? prod.discountPrice.toString() : '',
      stockQuantity: prod.stockQuantity.toString(),
      category: prod.category,
      images: prod.images || []
    });
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this grocery product?')) return;
    try {
      await api.delete(`/api/products/${productId}`);
      showToast('Product deleted.', 'success');
      fetchViewData();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/api/admin/orders/${orderId}`);
      showToast('Order deleted.', 'success');
      fetchViewData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete order.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      showToast('User deleted.', 'success');
      fetchViewData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete user.', 'error');
    }
  };

  // --- CATEGORY CRUD HANDLERS ---

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      showToast('Category name is required.', 'warning');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory._id}`, categoryForm);
        showToast('Category updated successfully!', 'success');
      } else {
        await api.post('/api/categories', categoryForm);
        showToast('Category added successfully!', 'success');
      }

      setCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', image: '' });
      fetchViewData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save category.', 'error');
    }
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || ''
    });
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/categories/${catId}`);
      showToast('Category deleted.', 'success');
      fetchViewData();
    } catch (err) {
      showToast('Failed to delete category.', 'error');
    }
  };

  // --- ORDER MANAGEMENT ---

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderUpdating(true);
    try {
      await api.put(`/api/admin/orders/${orderId}`, { orderStatus: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchViewData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    } finally {
      setOrderUpdating(false);
    }
  };

  if (authLoading || !user || !isAdmin) return <LoadingSpinner fullScreen={true} />;

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b pb-5 border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 m-0">GreenHub Admin Panel</h1>
            <p className="text-slate-500 font-medium text-xs mt-1">Manage grocery inventory, track client orders, and review store financials</p>
          </div>
          <button
            onClick={fetchViewData}
            className="p-2 border bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm text-slate-500"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Left Side: Navigation Links */}
          <aside className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col gap-1">
            <button
              onClick={() => handleViewChange('overview')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'overview' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button
              onClick={() => handleViewChange('products')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'products' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <ShoppingBag size={16} />
              Products
            </button>
            <button
              onClick={() => handleViewChange('categories')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'categories' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <FolderTree size={16} />
              Categories
            </button>
            <button
              onClick={() => handleViewChange('orders')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'orders' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <ShoppingBag size={16} />
              Orders
            </button>
            <button
              onClick={() => handleViewChange('users')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                currentView === 'users' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Users size={16} />
              Users
            </button>
          </aside>

          {/* Right Side: Render View Content */}
          <div className="lg:col-span-4 space-y-6">
            
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                
                {/* VIEW 1: Overview Summary */}
                {currentView === 'overview' && dashboardData && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Metrics cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Sales</span>
                          <h3 className="text-2xl font-extrabold text-slate-800 m-0">₹{dashboardData.metrics.totalSales.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl"><DollarSign size={20} /></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
                          <h3 className="text-2xl font-extrabold text-slate-800 m-0">{dashboardData.metrics.totalOrders}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl"><ShoppingBag size={20} /></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Customers</span>
                          <h3 className="text-2xl font-extrabold text-slate-800 m-0">{dashboardData.metrics.totalCustomers}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-700 rounded-xl"><Users size={20} /></div>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Products Catalogue</span>
                          <h3 className="text-2xl font-extrabold text-slate-800 m-0">{dashboardData.metrics.totalProducts}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-xl"><TrendingUp size={20} /></div>
                      </div>
                    </div>

                    {/* Sales category reports */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100 flex items-center gap-1.5 font-sans">
                          <BarChart3 size={16} className="text-emerald-700" /> Category Sales
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(dashboardData.categorySales || {}).map(([catName, saleAmt]) => (
                            <div key={catName} className="flex justify-between items-center text-xs font-semibold text-slate-600 uppercase">
                              <span>{catName}</span>
                              <span className="text-slate-800 font-extrabold">₹{saleAmt.toFixed(2)}</span>
                            </div>
                          ))}
                          {Object.keys(dashboardData.categorySales || {}).length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-4 font-medium">No sales recorded yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Daily revenue reports */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100 flex items-center gap-1.5 font-sans">
                          <DollarSign size={16} className="text-emerald-700" /> Daily Revenue
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(dashboardData.dailySales || {}).map(([dateVal, saleAmt]) => (
                            <div key={dateVal} className="flex justify-between items-center text-xs font-semibold text-slate-600">
                              <span>{new Date(dateVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              <span className="text-emerald-700 font-extrabold">₹{saleAmt.toFixed(2)}</span>
                            </div>
                          ))}
                          {Object.keys(dashboardData.dailySales || {}).length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-4 font-medium">No daily sales yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Recent placed orders */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100 flex items-center gap-1.5 font-sans">
                          <ShoppingBag size={16} className="text-emerald-700" /> Recent Orders
                        </h3>
                        <div className="divide-y divide-slate-100">
                          {dashboardData.recentOrders?.map((ro) => (
                            <div key={ro._id} className="py-3 flex justify-between items-center text-xs font-semibold text-slate-600 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                {ro.items?.[0]?.image ? (
                                  <img src={ro.items[0].image} alt={ro.items[0].name} className="w-9 h-9 object-cover rounded-lg border border-slate-100 shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 bg-emerald-50 rounded-lg border border-slate-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                                    📦
                                  </div>
                                )}
                                <div>
                                  <span className="text-slate-800 font-bold block line-clamp-1">
                                    {ro.items?.[0]?.name || 'Grocery Order'}
                                    {ro.items?.length > 1 && <span className="text-emerald-600 font-semibold text-[10px] ml-1">+{ro.items.length - 1} more</span>}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium block">#{ro._id} • {ro.customerName} • {new Date(ro.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-emerald-700 font-extrabold block">₹{ro.totalAmount.toFixed(2)}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  ro.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ro.orderStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                          {(!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) && (
                            <p className="text-center text-xs text-slate-400 py-4 font-medium">No recent orders.</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* VIEW 2: Products Catalogue Manager */}
                {currentView === 'products' && (
                  <div className="space-y-6 animate-fade-in bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-bold text-slate-800 m-0">Products catalogue list</h3>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', description: '', price: '', discountPrice: '', stockQuantity: '', category: '', images: [] });
                          setProductModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Add Product
                      </button>
                    </div>

                    {/* Table list */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b text-slate-400 uppercase font-bold">
                            <th className="py-3 px-2">Image</th>
                            <th className="py-3 px-2">Name</th>
                            <th className="py-3 px-2">Category</th>
                            <th className="py-3 px-2">Price</th>
                            <th className="py-3 px-2">Stock</th>
                            <th className="py-3 px-2">Units Sold</th>
                            <th className="py-3 px-2">Total Income</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {products.map((prod) => {
                            const img = prod.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100';
                            const salesInfo = dashboardData?.productSales?.[prod._id] || { revenue: 0.0, quantity: 0 };
                            return (
                              <tr key={prod._id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-2">
                                  <img src={img} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border" />
                                </td>
                                <td className="py-2.5 px-2 max-w-[150px] truncate">{prod.name}</td>
                                <td className="py-2.5 px-2 capitalize">{prod.category}</td>
                                <td className="py-2.5 px-2 text-emerald-700 font-extrabold">₹{prod.price.toFixed(2)}</td>
                                <td className="py-2.5 px-2">{prod.stockQuantity}</td>
                                <td className="py-2.5 px-2 text-slate-500 font-semibold">{salesInfo.quantity} units</td>
                                <td className="py-2.5 px-2 text-emerald-600 font-bold">₹{salesInfo.revenue.toFixed(2)}</td>
                                <td className="py-2.5 px-2 text-right space-x-1.5">
                                  <button onClick={() => openEditProduct(prod)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit size={14} /></button>
                                  <button onClick={() => handleDeleteProduct(prod._id)} className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VIEW 3: Categories Manager */}
                {currentView === 'categories' && (
                  <div className="space-y-6 animate-fade-in bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-bold text-slate-800 m-0 font-sans">Manage categories</h3>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm({ name: '', slug: '', image: '' });
                          setCategoryModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Add Category
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {categories.map((cat) => (
                        <div key={cat._id} className="bg-slate-50 border p-4 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {cat.image && (
                              <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-full border shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <span className="font-bold text-slate-800 text-sm block truncate">{cat.name}</span>
                              <span className="text-[10px] text-slate-400 block font-semibold truncate">{cat.slug}</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => openEditCategory(cat)} className="p-1.5 text-blue-600 bg-white border hover:bg-slate-100 rounded-lg"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 text-rose-600 bg-white border hover:bg-slate-100 rounded-lg"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 4: Customer Orders Manager */}
                {currentView === 'orders' && (
                  <div className="space-y-6 animate-fade-in bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100">Customer Orders Queue</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b text-slate-400 uppercase font-bold">
                            <th className="py-3 px-2">Product & Order</th>
                            <th className="py-3 px-2">Customer</th>
                            <th className="py-3 px-2">Total Cost</th>
                            <th className="py-3 px-2">Current Status</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-2">
                                <div className="flex items-center gap-2.5">
                                  {order.items?.[0]?.image ? (
                                    <img src={order.items[0].image} alt={order.items[0].name} className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-slate-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                                      📦
                                    </div>
                                  )}
                                  <div className="max-w-[180px]">
                                    <span className="font-bold text-slate-800 text-xs block truncate" title={order.items?.[0]?.name}>
                                      {order.items?.[0]?.name || 'Grocery Order'}
                                      {order.items?.length > 1 && <span className="text-emerald-600 font-semibold text-[10px] ml-1">+{order.items.length - 1} more</span>}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono block truncate">#{order._id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className="block text-slate-800">{order.customerName}</span>
                                <span className="text-[10px] text-slate-400 font-semibold leading-none">{order.customerEmail}</span>
                              </td>
                              <td className="py-3.5 px-2 text-emerald-700 font-extrabold">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="py-3.5 px-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                  order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  order.orderStatus === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-right space-x-1.5 flex items-center justify-end">
                                <select
                                  disabled={orderUpdating}
                                  value={order.orderStatus}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VIEW 5: Registered Users */}
                {currentView === 'users' && (
                  <div className="space-y-6 animate-fade-in bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 m-0 pb-3 border-b border-slate-100">Registered Users Profiles</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b text-slate-400 uppercase font-bold">
                            <th className="py-3 px-2">Name</th>
                            <th className="py-3 px-2">Email</th>
                            <th className="py-3 px-2">Phone</th>
                            <th className="py-3 px-2">Role</th>
                            <th className="py-3 px-2">Address</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-2 font-bold">{u.name}</td>
                              <td className="py-3 px-2 font-medium text-slate-500">{u.email}</td>
                              <td className="py-3 px-2">{u.phone || '-'}</td>
                              <td className="py-3 px-2 capitalize">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3 px-2 truncate max-w-[150px]" title={u.address}>{u.address || '-'}</td>
                              <td className="py-3 px-2 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </>
            )}

          </div>

        </div>

      </div>

      {/* PRODUCT MODAL OVERLAY */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 m-0">
              {editingProduct ? 'Edit Grocery Product' : 'Add New Grocery Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Category Code *</label>
                  <select
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm((p) => ({ ...p, discountPrice: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                  />
                </div>
              </div>

              {/* Upload image */}
              <div>
                <label className="block uppercase text-slate-400 mb-1">Product Images</label>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Photo list */}
                  {productForm.images.map((imgUrl, i) => (
                    <div key={i} className="relative w-14 h-14 border rounded-xl overflow-hidden shrink-0">
                      <img src={imgUrl} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProductForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i)
                        }))}
                        className="absolute inset-0 bg-red-600/70 text-white font-bold text-[9px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload button wrapper */}
                  <label className="w-14 h-14 border border-dashed border-slate-300 hover:border-emerald-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-700 cursor-pointer shrink-0 transition-colors">
                    <Upload size={16} />
                    <span className="text-[7px] font-bold uppercase mt-1">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL OVERLAY */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2 m-0">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block uppercase text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({
                    ...p,
                    name: e.target.value,
                    slug: editingCategory ? p.slug : e.target.value.toLowerCase().replace(/\s+/g, '-')
                  }))}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1">Category Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                />
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1">Photo URL link</label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
