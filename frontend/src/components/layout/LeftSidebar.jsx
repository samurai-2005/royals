import { Link } from 'react-router-dom';

const LeftSidebar = () => {
  const categories = ['Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'];
  // Updated list: Only School Uniforms, NCC, and Security Guard
  const orgs = ['School Uniforms', 'NCC', 'Security Guard'];

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Full Catalog Directory Link */}
      <div className="mb-6">
        <Link 
          to="/catalog" 
          className="flex items-center justify-center w-full bg-zinc-800 border border-zinc-700 text-white font-bold py-2.5 rounded-lg hover:bg-zinc-700 transition-colors text-xs tracking-wider uppercase shadow-sm"
        >
          📋 Uniform Directory
        </Link>
      </div>

      {/* Organization Filter */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Organizations</h3>
        <ul className="space-y-3 text-sm text-zinc-300">
          {orgs.map(org => (
            <li key={org}>
              <Link to={`/category/${org.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">
                {org}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Apparel Types */}
      <div className="mb-8 flex-1">
        <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Explore</h3>
        <ul className="space-y-3 text-sm text-zinc-300">
          {categories.map(cat => (
            <li key={cat}>
              <Link to={`/category/${cat.toLowerCase()}`} className="hover:text-white transition-colors">
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* B2B Bulk Order CTA */}
      <div className="mt-auto">
        <Link 
          to="/bulk-order" 
          className="block w-full bg-white text-black text-center font-bold py-3 rounded hover:bg-zinc-200 transition-colors"
        >
          Bulk / Uniform Enquiry
        </Link>
      </div>
    </div>
  );
};

export default LeftSidebar;