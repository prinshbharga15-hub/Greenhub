import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Heart, Store } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Banner Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase">
            <Leaf size={12} />
            Our Fresh Harvest Story
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-800 m-0">About GreenHub Grocery</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We are dedicated to bridging the gap between local organic farms and your family kitchen table.
          </p>
        </div>

        {/* Narrative / Image Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-md aspect-square bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=500"
              alt="Organic Tomatoes Farm"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 m-0">Healthy Living, Simplified</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Founded in 2026, GreenHub started with a simple belief: everyone deserves access to healthy, natural food that is grown sustainably. We partnered with regional, small-scale farmers who prioritize environmental stewardship, avoiding synthetic chemical fertilizers or pesticides.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              We carefully inspect and pick every crop, packaging them with care and delivering them in climate-controlled environments to preserve flavor, crunch, and nutritional value.
            </p>
          </div>
        </div>

        {/* Core Values grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center m-0">Our Core Principles</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Leaf size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm m-0">Absolute Freshness</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Picked and packed at peak ripeness, ensuring optimal vitamins and crispy delicious flavor.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm m-0">Pure Transparency</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Know where your food comes from. We guarantee 100% trace-back to our farmer partners.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Heart size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm m-0">Eco Friendly Packaging</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                We use biodegradable bags and boxes, minimizing trash impact and respecting planet earth.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-emerald-900 rounded-3xl text-white p-8 sm:p-10 shadow-lg text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white m-0">Ready to taste the fresh difference?</h2>
          <p className="text-emerald-200/80 text-xs sm:text-sm font-semibold max-w-lg mx-auto leading-relaxed">
            Register your account today to receive direct door delivery of seasonal fresh fruits, organic greens, and daily eggs.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs shadow-md transition-colors"
          >
            <Store size={14} /> Shop Organic Produce
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;
