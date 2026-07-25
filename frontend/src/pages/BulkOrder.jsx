import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import { FiPhoneCall, FiScissors, FiTruck, FiUsers, FiCheckCircle } from 'react-icons/fi';

const BulkOrder = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // The phone number for appointments
  const contactNumber = "+919576793770"; 

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // CORRECTED: Added template literal syntax and point to the correct endpoint
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        
        // Filter the products for active deals just like Deals.jsx
        const discountedDeals = data.filter(product => product.discountPercentage > 0);
        setDeals(discountedDeals);
      } catch (error) {
        console.error("Failed to fetch promotional deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const steps = [
    {
      icon: <FiPhoneCall size={32} className="text-white" />,
      title: "1. Book Appointment",
      desc: "Call us to schedule a site visit at your institution or office."
    },
    {
      icon: <FiUsers size={32} className="text-white" />,
      title: "2. On-Site Measurement",
      desc: "Our master tailors arrive at your location and take precise measurements of every team member."
    },
    {
      icon: <FiScissors size={32} className="text-white" />,
      title: "3. Custom Stitching",
      desc: "Uniforms are handcrafted in our workshop with premium fabrics to ensure a perfect fit."
    },
    {
      icon: <FiTruck size={32} className="text-white" />,
      title: "4. Doorstep Delivery",
      desc: "The fully packaged, custom-fitted uniforms are delivered straight to your organization."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      
      {/* HERO SECTION */}
      <div className="relative bg-[#18181b] border-b border-zinc-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Premium Custom Uniforms <br className="hidden md:block" />
            <span className="text-zinc-500">For Your Entire Team.</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Whether it is an army battalion, a police force, or a corporate security team, we bring the tailor shop to you. No hassle, perfect fits, and bulk pricing.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={`tel:${contactNumber}`}
              className="flex items-center justify-center w-full sm:w-auto bg-white text-black font-black text-lg px-8 py-4 rounded-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:bg-zinc-200 transition-all hover:scale-105"
            >
              <FiPhoneCall className="mr-3" size={24} /> Call Now for Appointment
            </a>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest sm:hidden">or</p>
            <p className="text-sm font-bold text-zinc-400 hidden sm:block">Available Mon-Sat, 9AM to 7PM</p>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">The Royal Tailor Experience</h2>
          <p className="text-zinc-400">Zero logistics on your end. We handle everything from measuring tape to delivery truck.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-[#18181b] border border-zinc-800 p-8 rounded-2xl hover:border-zinc-500 transition-colors relative group">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PERKS SECTION */}
      <div className="bg-[#18181b] border-y border-zinc-800 py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center text-zinc-300">
            <FiCheckCircle className="text-green-500 mr-3" size={24} />
            <span className="font-bold">Wholesale Pricing Applied</span>
          </div>
          <div className="flex items-center text-zinc-300">
            <FiCheckCircle className="text-green-500 mr-3" size={24} />
            <span className="font-bold">Premium Govt-Approved Fabrics</span>
          </div>
          <div className="flex items-center text-zinc-300">
            <FiCheckCircle className="text-green-500 mr-3" size={24} />
            <span className="font-bold">Free Alterations Guaranteed</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SALES & PROMOTIONS */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-3xl font-black mb-2">Current Promotions</h2>
            <p className="text-zinc-400">Check out our active sales on bulk-ready inventory.</p>
          </div>
          <span className="bg-red-900/30 text-red-500 border border-red-900 text-xs font-black px-3 py-1.5 rounded uppercase tracking-widest hidden sm:block">
            Limited Time
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-zinc-500">Loading active deals...</div>
        ) : deals.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 bg-[#18181b] border border-zinc-800 rounded-xl">
            No active promotional sales at the moment. Call us for custom bulk discounts!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <div className="py-20 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-black mb-6">Ready to outfit your organization?</h2>
        <a 
          href={`tel:${contactNumber}`}
          className="inline-flex items-center justify-center bg-white text-black font-black text-lg px-8 py-4 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <FiPhoneCall className="mr-3" size={24} /> {contactNumber}
        </a>
      </div>

    </div>
  );
};

export default BulkOrder;