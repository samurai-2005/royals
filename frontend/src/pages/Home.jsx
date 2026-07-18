import { Link } from 'react-router-dom';
import { FiShield, FiBriefcase, FiStar, FiNavigation } from 'react-icons/fi';

const Home = () => {
  
  // Data for the top Job Uniforms section
  const uniforms = [
    { name: "NCC Uniforms", path: "/category/ncc", icon: <FiStar size={28} /> },
    { name: "Bihar Police", path: "/category/bihar-police", icon: <FiShield size={28} /> },
    { name: "Security Guard", path: "/category/security", icon: <FiBriefcase size={28} /> },
    { name: "Indian Army", path: "/category/army", icon: <FiNavigation size={28} /> }
  ];

  // Data for the bottom Clothes/Apparel section
  const clothes = [
    { name: "Shirts", path: "/category/shirts" },
    { name: "T-Shirts", path: "/category/tshirts" },
    { name: "Trousers", path: "/category/trousers" },
    { name: "Pants", path: "/category/pants" },
    { name: "Accessories", path: "/category/accessories" }
  ];

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-10">
      
      {/* 1. UNIFORMS SECTION */}
      <div className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-5 tracking-wide">Job Uniforms</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* 2. CLOTHES SECTION */}
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