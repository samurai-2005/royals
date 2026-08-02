import { useLocation, Link } from 'react-router-dom';
import { FiShield, FiFileText, FiRefreshCw, FiTruck } from 'react-icons/fi';

const policies = {
  '/refund-policy': {
    title: 'Refund, Return & Cancellation Policy',
    icon: <FiRefreshCw size={28} />,
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Order Cancellation',
        content: `Orders can be cancelled within 12 hours of placement or prior to dispatch by emailing orders@royaltailors.net. Once dispatched via Shiprocket, orders cannot be cancelled.`
      },
      {
        heading: '2. Returns & Exchanges',
        content: `We accept return or replacement requests within 7 days of delivery for items that arrive defective, damaged, or incorrectly sized. Items must be unworn, unwashed, and in original packaging with tags intact.`
      },
      {
        heading: '3. Custom & Tailored Uniforms',
        content: `Custom-tailored uniform sets or personalized badge items are non-returnable unless defective or incorrectly fulfilled on our part.`
      },
      {
        heading: '4. Refund Processing',
        content: `Approved refunds are processed within 5-7 business days back to your original payment method or bank account.`
      }
    ]
  },
  '/shipping-policy': {
    title: 'Shipping & Delivery Policy',
    icon: <FiTruck size={28} />,
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Processing Time',
        content: `Standard uniform items are processed within 1–2 business days. Custom-tailored orders require 3–5 business days for precision stitching prior to dispatch.`
      },
      {
        heading: '2. Shipping Charges & Timelines',
        content: `We ship pan-India using verified couriers via Shiprocket. Standard delivery takes 3 to 7 business days. Orders over Rs. 2,000 qualify for FREE delivery; orders below Rs. 2,000 incur a standard Rs. 150 shipping fee.`
      },
      {
        heading: '3. Real-Time Tracking',
        content: `Once shipped, tracking numbers and tracking links are instantly updated in your account profile and sent via email.`
      }
    ]
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    icon: <FiShield size={28} />,
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        content: `We collect essential details to process orders: Name, Delivery Address, PIN Code, Phone Number, and Email Address.`
      },
      {
        heading: '2. Data Usage & Encryption',
        content: `Your data is strictly used for order processing and delivery. Online payment transactions are handled through encrypted payment gateways; we never store card numbers or PINs on our servers.`
      },
      {
        heading: '3. Third-Party Services',
        content: `We only share necessary address details with our logistics provider (Shiprocket) for delivery fulfillment and Sentry for application performance monitoring.`
      }
    ]
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    icon: <FiFileText size={28} />,
    lastUpdated: 'August 2026',
    sections: [
      {
        heading: '1. General Terms',
        content: `By accessing royaltailors.net, you agree to comply with our terms. Prices and product specifications are subject to change without prior notice.`
      },
      {
        heading: '2. Account Security',
        content: `Users are responsible for maintaining the confidentiality of their login credentials.`
      },
      {
        heading: '3. Governing Law',
        content: `These terms are governed by the laws of India, with jurisdiction in Patna, Bihar.`
      }
    ]
  }
};

const PolicyPage = () => {
  const { pathname } = useLocation();
  const currentPolicy = policies[pathname] || policies['/refund-policy'];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-white pb-28">
      {/* Policy Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800 pb-4">
        {Object.keys(policies).map((path) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              pathname === path 
                ? 'bg-white text-black' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {policies[path].title}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl mb-6 shadow-xl flex items-center gap-4">
        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-white">
          {currentPolicy.icon}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">{currentPolicy.title}</h1>
          <p className="text-xs text-zinc-500 mt-1">Last Updated: {currentPolicy.lastUpdated}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        {currentPolicy.sections.map((section, idx) => (
          <div key={idx} className="space-y-2 border-b border-zinc-800/60 pb-5 last:border-b-0 last:pb-0">
            <h2 className="text-lg font-bold text-zinc-200">{section.heading}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-xs text-zinc-400 text-center mt-6">
          For any questions regarding these policies, reach out to <a href="mailto:orders@royaltailors.net" className="text-white font-bold underline">orders@royaltailors.net</a> or visit our <Link to="/contact" className="text-white font-bold underline">Contact Page</Link>.
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;