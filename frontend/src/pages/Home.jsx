import { Link } from 'react-router-dom';
import { FiBriefcase, FiStar, FiPhoneCall, FiBookOpen } from 'react-icons/fi';

const Home = () => {
  // UPDATED: Strictly School Uniforms, NCC Uniforms, and Security Guard
  const uniforms = [
    { name: "School Uniforms", path: "/category/school-uniforms", icon: <FiBookOpen size={28} /> },
    { name: "NCC Uniforms", path: "/category/ncc", icon: <FiStar size={28} /> },
    { name: "Security Guard", path: "/category/security-guard", icon: <FiBriefcase size={28} /> }
  ];

  const clothes = [
    { name: "Shirts", path: "/category/shirts" },
    { name: "T-Shirts", path: "/category/tshirts" },
    { name: "Trousers", path: "/category/trousers" },
    { name: "Pants", path: "/category/pants" },
    { name: "Accessories", path: "/category/accessories" }
  ];

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      
      {/* Mobile-Only Bulk Order Button */}
      <div className="md:hidden mb-8">
        <Link 
          to="/bulk-order" 
          className="w-full bg-white text-black font-black py-4 rounded-xl shadow-lg flex items-center justify-center transition-colors active:bg-zinc-200"
        >
          <FiPhoneCall className="mr-2" size={18} /> Bulk / Uniform Enquiry
        </Link>
      </div>

      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">Job Uniforms</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {uniforms.map((u, index) => (
            <Link 
              key={index} 
              to={u.path} 
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center hover:border-zinc-500 hover:bg-zinc-800 transition-all text-center group"
            >
              <div className="text-zinc-500 group-hover:text-white transition-colors mb-4">
                {u.icon}
              </div>
              <span className="text-white font-bold text-sm md:text-base">
                {u.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">Clothes & Components</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {clothes.map((c, index) => (
            <Link 
              key={index} 
              to={c.path} 
              className="bg-[#18181b] border border-zinc-800 rounded-lg p-5 flex items-center justify-center hover:border-zinc-500 transition-colors"
            >
              <span className="text-zinc-400 font-semibold text-sm">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;