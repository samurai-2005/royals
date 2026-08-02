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
    <div className="p-4 md:p-8 max-w-6xl mx-auto text-white pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Contact Customer Support</h1>
        <p className="text-zinc-400 text-sm md:text-base">
          Have questions about your uniform order, sizing, or custom tailoring? Our team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800">
              <FiMapPin size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Store & Workshop</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Rupaspur, Bailey Road,<br />
                Patna, Bihar - 801503, India
              </p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800">
              <FiMail size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Email Us</h3>
              <p className="text-sm text-zinc-400 mt-1">orders@royaltailors.net</p>
              <p className="text-xs text-zinc-500 mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800">
              <FiPhone size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Phone / WhatsApp</h3>
              <p className="text-sm text-zinc-400 mt-1">+91 98765 43210</p>
              <p className="text-xs text-zinc-500 mt-0.5">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800">
              <FiClock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Operating Hours</h3>
              <p className="text-sm text-zinc-400 mt-1">Monday – Saturday</p>
              <p className="text-xs text-zinc-500 mt-0.5">10:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-green-950/40 border border-green-800 p-8 rounded-xl text-center space-y-3">
              <FiCheckCircle size={48} className="text-green-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Thank You!</h3>
              <p className="text-sm text-zinc-300">
                Your message has been received. Our support team will get back to you shortly at <span className="text-white font-bold">{formData.email}</span>.
              </p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Order Inquiry / Sizing Question"
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Message</label>
                <textarea 
                  rows={5} 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 text-sm resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg"
              >
                <FiSend size={16} /> Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;