import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const faqData = [
    {
      q: 'Where do you source your organic products?',
      a: 'We partner directly with local, certified organic farms situated within a 100-mile radius of our distribution center. This guarantees minimal transportation time and maximum freshness.'
    },
    {
      q: 'How long does delivery take?',
      a: 'We offer next-day home delivery for all orders placed before 8:00 PM. During checkout, you can select your preferred delivery time window.'
    },
    {
      q: 'Is there a minimum order amount for free delivery?',
      a: 'Yes, we provide completely free home delivery for all orders totaling ₹35.00 or more. For orders below ₹35.00, a flat delivery fee of ₹4.99 is applied.'
    },
    {
      q: 'What payment methods do you support?',
      a: 'We support Cash on Delivery (COD). You can pay in physical cash or via local mobile payment apps directly to the courier upon checking the quality of your delivered items.'
    },
    {
      q: 'What is your refund and return policy?',
      a: 'Since we deliver perishable fresh groceries, we inspect items at delivery. If you are unsatisfied with the quality of any fruit, vegetable, or item, you can return it directly with the delivery agent for an immediate discount on your COD receipt or store credit.'
    },
    {
      q: 'How do I apply a discount coupon?',
      a: 'In your Shopping Cart page, enter your promo code in the "Promo Code" input field (e.g. GREEN20) and click Apply. The subtotal discount will be automatically reflected in your receipt summary.'
    }
  ];

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <HelpCircle size={38} className="text-emerald-600 mx-auto" />
          <h1 className="text-3xl font-extrabold text-slate-800 m-0">FAQ & Customer Help</h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-lg mx-auto">
            Got questions about delivery regions, organic freshness certificates, or ordering? Find quick answers here.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = expandedIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition-colors hover:bg-emerald-50/20"
                >
                  <span className="font-bold text-slate-800 text-sm">{item.q}</span>
                  <span className="text-emerald-600 shrink-0 ml-4">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 text-slate-600 text-xs font-medium leading-relaxed border-t border-slate-50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FAQ;
