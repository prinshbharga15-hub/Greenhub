import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';

const Contact = () => {
  const { showToast } = React.useContext(ToastContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in required fields.', 'warning');
      return;
    }
    setLoading(true);
    // Mock submit delay
    setTimeout(() => {
      showToast('Thank you! Your message has been sent successfully.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header banner */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 m-0">Contact GreenHub</h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Have questions about our fresh crops, bulk orders, or farm sourcing? Get in touch with our team today!
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Column 1 & 2: Contact Form */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 m-0 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Mail className="text-emerald-600" size={20} />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase text-slate-400 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block uppercase text-slate-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1.5">Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1.5">Message / Inquiry</label>
                <textarea
                  rows="6"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-800 font-medium text-sm"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Send size={14} />
                {loading ? 'Sending message...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Column 3: Contact Info Details */}
          <div className="space-y-6">
            
            {/* Info Box */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Information Desk</h3>
              <ul className="space-y-4 text-xs font-semibold text-slate-600">
                <li className="flex gap-3 items-start">
                  <MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>100 Organic Ave, Green Garden City, GC 12345</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Phone size={16} className="text-emerald-600 shrink-0" />
                  <span>+1 (555) 019-2834</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail size={16} className="text-emerald-600 shrink-0" />
                  <span>support@greenhub.com</span>
                </li>
              </ul>
            </div>

            {/* Hours Box */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Working Hours
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li className="flex justify-between">
                  <span>Mon - Fri</span>
                  <span className="text-slate-800 font-bold">8:00 AM - 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-slate-800 font-bold">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between text-emerald-600">
                  <span>Sunday</span>
                  <span className="font-bold">Closed</span>
                </li>
              </ul>
            </div>

            {/* Quick Help */}
            <div className="bg-emerald-950 text-emerald-100 rounded-3xl p-6 shadow-md relative overflow-hidden space-y-3">
              <h3 className="font-extrabold text-white text-sm m-0">Need Quick Answers?</h3>
              <p className="text-[10px] text-emerald-200/70 font-semibold leading-relaxed">
                Check our Frequently Asked Questions page first to find instant details on delivery schedules, refunds, or discounts.
              </p>
              <Link
                to="/faq"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Go to FAQ Section &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
