import { Link } from 'react-router-dom';
import { FiPhoneCall } from 'react-icons/fi';

const Home = () => {
  const uniforms = [
    { 
      name: "School Uniforms", 
      path: "/category/school-uniforms", 
      image: "/emblems/school-uniform.png" // or direct Cloudinary link
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

      {/* JOB UNIFORMS FULL EMBLEM CARDS */}
      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">
          Job Uniforms
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {uniforms.map((u, index) => (
            <Link 
              key={index} 
              to={u.path} 
              className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/60 transition-all duration-300 aspect-[3/4] shadow-xl block"
            >
              <img 
                src={u.image} 
                alt={u.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400/18181b/ffffff?text=Emblem';
                }}
              />
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