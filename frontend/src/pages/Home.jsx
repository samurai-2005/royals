import { Link } from 'react-router-dom';
import { FiPhoneCall } from 'react-icons/fi';

const Home = () => {
  // UPDATED: Category array using custom emblem image paths
  const uniforms = [
    { 
      name: "School Uniforms", 
      path: "/category/school-uniforms", 
      image: "/emblems/school-uniform.png" // Or direct Cloudinary URL
    },
    { 
      name: "NCC Uniforms", 
      path: "/category/ncc", 
      image: "/emblems/ncc.png" 
    },
    { 
      name: "Security Guard", 
      path: "/category/security-guard", 
      image: "/emblems/security-guard.png" 
    }
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

      {/* JOB UNIFORMS WITH CUSTOM EMBLEMS */}
      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">
          Job Uniforms
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {uniforms.map((u, index) => (
            <Link 
              key={index} 
              to={u.path} 
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center hover:border-zinc-500 hover:bg-zinc-800/80 transition-all text-center group shadow-md"
            >
              {/* Pixel-Constrained Emblem Container */}
              <div className="w-20 h-24 md:w-24 md:h-28 mb-3 flex items-center justify-center">
                <img 
                  src={u.image} 
                  alt={u.name} 
                  className="max-w-full max-h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=Emblem';
                  }}
                />
              </div>

              <span className="text-white font-bold text-sm md:text-base group-hover:text-amber-400 transition-colors uppercase tracking-wider">
                {u.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* CLOTHES & COMPONENTS */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">
          Clothes & Components
        </h2>
        
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