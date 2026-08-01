import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Read URL search params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    // Fetch categories for sidebar filter
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch products based on active filters
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryParam) params.append('category', categoryParam);
        if (searchParam) params.append('search', searchParam);
        if (sortParam) params.append('sort', sortParam);
        params.append('page', pageParam.toString());
        params.append('limit', '8'); // 8 items per page

        const res = await api.get(`/api/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || {});
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryParam, searchParam, sortParam, pageParam]);

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1'); // reset page to 1
    if (slug === categoryParam) {
      newParams.delete('category'); // Toggle category off
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (e.target.value) {
      newParams.set('sort', e.target.value);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Breadcrumbs / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 m-0">
              {categoryParam ? `Shop ${categoryParam.replace('-', ' ')}` : 'GreenHub Fresh Store'}
            </h1>
            <p className="text-slate-500 font-medium text-xs mt-1">
              {searchParam ? `Showing search results for "${searchParam}"` : 'Browse fresh organic crops and dairy'}
            </p>
          </div>
          
          {/* Sorting and Filter Toggles */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-700 text-sm font-semibold shadow-sm transition-all md:hidden"
            >
              <Filter size={16} />
              Filters
            </button>

            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700">
              <ArrowUpDown size={16} className="text-slate-400" />
              <select
                value={sortParam}
                onChange={handleSortChange}
                className="bg-transparent focus:outline-none cursor-pointer border-none text-slate-700 pr-4 font-semibold text-xs"
              >
                <option value="">Sort By: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filter Sidebar (Desktop) */}
          <aside className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:block ${filterOpen ? 'fixed inset-0 z-50 overflow-y-auto block' : 'hidden'}`}>
            <div className="flex items-center justify-between lg:justify-start lg:gap-3 mb-2">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-600" />
                Filter Options
              </h3>
              {filterOpen && (
                <button onClick={() => setFilterOpen(false)} className="p-1 hover:bg-slate-100 rounded-full lg:hidden">
                  <X size={20} />
                </button>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Category Filter */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-3">Shop Categories</h4>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      handleCategorySelect(cat.slug);
                      setFilterOpen(false); // close mobile filter drawer
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      categoryParam === cat.slug
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                        : 'text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear All Filters */}
            {(categoryParam || searchParam || sortParam) && (
              <button
                onClick={() => {
                  clearAllFilters();
                  setFilterOpen(false);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Product Listing Main Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mb-2">No Products Found</h3>
                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                  We couldn't find any products matching your filters. Try clearing some options or checking back later!
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full transition-all"
                >
                  Reset Shop
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Product Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2.5 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => handlePageChange(pageParam - 1)}
                      disabled={pageParam === 1}
                      className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, index) => {
                      const num = index + 1;
                      return (
                        <button
                          key={num}
                          onClick={() => handlePageChange(num)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                            pageParam === num
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pageParam + 1)}
                      disabled={pageParam === pagination.totalPages}
                      className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductList;
