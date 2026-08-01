import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products?limit=4')
        ]);
        setCategories(catRes.data || []);
        setFeaturedProducts(prodRes.data.products || []);
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen={true} />;

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative shapes */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 border border-emerald-700 rounded-full text-xs font-bold tracking-wide text-emerald-300">
              <Sparkles size={14} />
              Fresh Groceries Delivered Daily
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white m-0">
              Fresh, Organic <br className="hidden sm:inline" />
              <span className="text-emerald-400">Groceries</span> To Your Door
            </h1>
            <p className="text-emerald-100/80 text-base sm:text-lg max-w-lg mx-auto lg:mx-0">
              Shop fresh, locally harvested vegetables, ripe fruits, wholesome dairy, and pantry essentials. Healthy living made effortless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-all shadow-lg shadow-emerald-900/30 gap-2 text-sm group"
              >
                Start Shopping
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold rounded-full transition-all text-sm"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-emerald-900/30">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
                alt="Fresh Organic Vegetables"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Weekly Offer</div>
                <div className="text-lg font-bold text-white mb-2">Get 20% Off Organic Greens</div>
                <Link to="/products?category=vegetables" className="text-white text-xs font-bold flex items-center gap-1 hover:underline">
                  Shop Vegetables <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0"><Truck size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Free Home Delivery</h3>
              <p className="text-xs text-slate-500 font-medium">On all orders above ₹35.00</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0"><Leaf size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">100% Organic Fresh</h3>
              <p className="text-xs text-slate-500 font-medium">Sourced directly from local farmers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-emerald-50/50 transition-colors">
            <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Secure COD Payment</h3>
              <p className="text-xs text-slate-500 font-medium">Pay safely on delivery of goods</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-3 m-0">Explore Fresh Categories</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Discover a wide variety of fresh local produce, bakery goods, wholesome dairy products, and pantry essentials.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category.slug}`}
              className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-slate-50 group-hover:scale-110 transition-transform duration-300">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors m-0 truncate">{category.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-emerald-50/30 border-y border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2 m-0">Our Featured Delights</h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">Fresh handpicked items highly recommended for you.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Full Store
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-3xl text-white p-10 md:p-16 relative overflow-hidden shadow-xl text-center md:text-left grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800/40 rounded-full blur-3xl"></div>
          
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0">Join Our GreenHub Community</h2>
            <p className="text-emerald-100/70 text-sm max-w-xl leading-relaxed font-medium">
              Subscribe now and receive a <strong className="text-emerald-400">20% discount coupon</strong> for your first order, plus updates on fresh crop cycles and exclusive offers.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 relative z-10 justify-center md:justify-start">
            <input
              type="email"
              placeholder="Enter email address"
              className="px-5 py-3 rounded-full border-none text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white font-medium text-sm sm:w-64"
            />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-full transition-colors text-sm shadow-md">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
