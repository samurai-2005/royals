import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // You can connect this to an email endpoint or backend service later
  };

  return (
    <div className="p-3 md:p-6 max-w-6xl mx-auto text-white pb-28">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">Contact Customer Support</h1>
        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
          Have questions about your uniform order, sizing, or custom tailoring? Our team is here to assist you.
        </p>
      </div>

      {/* Adaptive Layout: Stack/2x2 on laptops with dual sidebars, side-by-side on wide displays */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Contact Info Cards (2x2 grid on laptop width, single column on xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3.5 xl:col-span-1">
          
          <div className="bg-[#18181b] border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3.5 hover:border-zinc-700 transition-colors shadow-sm">
            <div className="p-2.5 bg-zinc-900 rounded-lg text-white border border-zinc-800 flex-shrink-0">
              <FiMapPin size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm">Store & Workshop</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-snug truncate">
                Rupaspur, Bailey Road,
              </p>
              <p className="text-xs text-zinc-400 leading-snug truncate">
                Patna, Bihar - 801503, India
              </p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3.5 hover:border-zinc-700 transition-colors shadow-sm">
            <div className="p-2.5 bg-zinc-900 rounded-lg text-white border border-zinc-800 flex-shrink-0">
              <FiMail size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm">Email Support</h3>
              <p className="text-xs text-zinc-300 font-semibold mt-1 truncate">support@royaltailors.net</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3.5 hover:border-zinc-700 transition-colors shadow-sm">
            <div className="p-2.5 bg-zinc-900 rounded-lg text-white border border-zinc-800 flex-shrink-0">
              <FiPhone size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm">Phone / WhatsApp</h3>
              <p className="text-xs text-zinc-300 font-semibold mt-1">+91 9576793770</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Mon - Sat: 10:00 AM - 7:00 PM</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800/80 p-4 rounded-xl flex items-start gap-3.5 hover:border-zinc-700 transition-colors shadow-sm">
            <div className="p-2.5 bg-zinc-900 rounded-lg text-white border border-zinc-800 flex-shrink-0">
              <FiClock size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-xs md:text-sm">Operating Hours</h3>
              <p className="text-xs text-zinc-400 mt-1">Monday – Saturday</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>

        {/* Contact Form Container */}
        <div className="xl:col-span-2 bg-[#18181b] border border-zinc-800/80 p-5 md:p-7 rounded-2xl shadow-xl">
          <h2 className="text-lg md:text-xl font-bold mb-5 tracking-tight">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-green-950/30 border border-green-800/60 p-6 md:p-8 rounded-xl text-center space-y-3">
              <FiCheckCircle size={42} className="text-green-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Thank You!</h3>
              <p className="text-xs md:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
                Your message has been received. Our support team will get back to you shortly at <span className="text-white font-bold">{formData.email}</span>.
              </p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors border border-zinc-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-[#0f0f0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs md:text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-[#0f0f0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs md:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Sizing Question"
                  className="w-full bg-[#0f0f0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs md:text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Message</label>
                <textarea 
                  rows={4} 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-[#0f0f0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs md:text-sm resize-none transition-colors"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm shadow-md mt-2"
              >
                <FiSend size={15} /> Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;