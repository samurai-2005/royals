import { Link } from 'react-router-dom';

const LeftSidebar = () => {
  const categories = ['Shirts', 'T-Shirts', 'Pants', 'Trousers', 'Accessories'];
  const orgs = ['NCC', 'Bihar Police', 'Security Guard', 'Indian Army'];

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Organization Filter */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">Organizations</h3>
        <ul className="space-y-3 text-sm text-zinc-300">
          {orgs.map(org => (
            <li key={org}>
              <Link to={`/category/${org.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors">
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