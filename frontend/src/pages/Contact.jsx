import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const Contact = () => {
  const navigate = useNavigate();
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

    // Format email parameters
    const mailSubject = encodeURIComponent(`[Support Request] ${formData.subject}`);
    const mailBody = encodeURIComponent(
      `Customer Name: ${formData.name}\nCustomer Email: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    // Triggers customer's mail client directly to support@royaltailors.net
    window.location.href = `mailto:support@royaltailors.net?subject=${mailSubject}&body=${mailBody}`;
  };

  return (
    <div className="max-w-5xl mx-auto text-white pb-28">
      
      {/* Go Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm w-fit cursor-pointer"
      >
        <FiArrowLeft size={16} /> Go Back
      </button>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">Contact Customer Support</h1>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Have questions about your uniform order, sizing, or custom tailoring? Our team is here to assist you.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 md:col-span-1">
          
          <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-md">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800 flex-shrink-0">
              <FiMapPin size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">Store & Workshop</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Rupaspur, Bailey Road,<br />
                Patna, Bihar - 801503, India
              </p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-md">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800 flex-shrink-0">
              <FiMail size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">Email Support</h3>
              <p className="text-xs text-zinc-300 font-semibold mt-1">support@royaltailors.net</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-md">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800 flex-shrink-0">
              <FiPhone size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">Phone / WhatsApp</h3>
              <p className="text-xs text-zinc-300 font-semibold mt-1">+91 9576793770</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Mon - Sat: 10:00 AM - 7:00 PM</p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-md">
            <div className="p-3 bg-zinc-900 rounded-xl text-white border border-zinc-800 flex-shrink-0">
              <FiClock size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">Operating Hours</h3>
              <p className="text-xs text-zinc-400 mt-1">Monday – Saturday</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>

        {/* Contact Form Container */}
        <div className="md:col-span-2 bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-green-950/30 border border-green-800/60 p-8 rounded-xl text-center space-y-3">
              <FiCheckCircle size={48} className="text-green-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Opening Email App...</h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Your message has been formatted for <span className="text-white font-bold">support@royaltailors.net</span>. If your mail application didn't launch automatically, click the button below.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`mailto:support@royaltailors.net?subject=${encodeURIComponent(`[Support Request] ${formData.subject}`)}&body=${encodeURIComponent(`Customer Name: ${formData.name}\nCustomer Email: ${formData.email}\n\nMessage:\n${formData.message}`)}`}
                  className="bg-white text-black font-bold text-xs px-6 py-2.5 rounded-lg transition-colors"
                >
                  Open Email Client
                </a>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors border border-zinc-700"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Your Name</label>
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
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Subject</label>
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
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Message</label>
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
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg mt-2 cursor-pointer"
              >
                <FiSend size={16} /> Send Email Directly
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;