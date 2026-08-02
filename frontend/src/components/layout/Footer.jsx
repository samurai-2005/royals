import { Link } from 'react-router-dom';
import { FiShield, FiTruck, FiRefreshCw, FiLock } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-[#0f0f0f] border-t border-zinc-800 text-zinc-400 pt-12 pb-28 md:pb-8 px-4 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-zinc-800/80 pb-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <FiShield size={28} className="text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase">100% Authentic</p>
              <p className="text-[11px] text-zinc-500">Premium Uniform Quality</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiTruck size={28} className="text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase">Express Shipping</p>
              <p className="text-[11px] text-zinc-500">Pan-India via Shiprocket</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiRefreshCw size={28} className="text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase">Easy Returns</p>
              <p className="text-[11px] text-zinc-500">7-Day Replacement Policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiLock size={28} className="text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase">Secure Checkout</p>
              <p className="text-[11px] text-zinc-500">256-Bit SSL Encrypted</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-lg font-black text-white tracking-wider">THE ROYAL TAILOR</h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Premier destination for tailor-made uniforms, academic kits, and institution accessories in Patna, Bihar.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-white tracking-wider">Shop Directory</p>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/catalog" className="hover:text-white transition-colors">All Uniforms</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Secure Checkout</Link></li>
              <li><Link to="/user-profile" className="hover:text-white transition-colors">My Orders</Link></li>
            </ul>
          </div>

          {/* Col 3: Mandatory Policies for Payment Gateway */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-white tracking-wider">Legal & Policies</p>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Address */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-white tracking-wider">Help & Contact</p>
            <p className="text-xs text-zinc-400">Rupaspur, Bailey Road, Patna, Bihar - 801503</p>
            <p className="text-xs text-zinc-400">Email: <a href="mailto:support@royaltailors.net" className="text-white hover:underline">support@royaltailors.net</a></p>
            <div className="pt-2">
              <Link to="/contact" className="inline-block bg-zinc-900 border border-zinc-700 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
                Visit Help Center
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar & Payment Modes */}
        <div className="border-t border-zinc-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} The Royal Tailor. All rights reserved.</p>
          <div className="flex items-center gap-3 text-zinc-500 font-bold text-[10px] uppercase">
            <span>Accepted Payments:</span>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-300">UPI</span>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-300">Cards</span>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-300">NetBanking</span>
            <span className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-300">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;