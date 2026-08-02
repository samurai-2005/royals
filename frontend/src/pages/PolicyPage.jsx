import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield, FiFileText, FiRefreshCw, FiTruck } from 'react-icons/fi';

const PolicyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine policy type purely from the current route path
  const path = location.pathname.toLowerCase();
  let currentPolicy = 'privacy';

  if (path.includes('term')) {
    currentPolicy = 'terms';
  } else if (path.includes('cancel') || path.includes('refund')) {
    currentPolicy = 'cancellation';
  } else if (path.includes('ship')) {
    currentPolicy = 'shipping';
  } else if (location.state?.policy) {
    currentPolicy = location.state.policy;
  }

  // Individual policy contents
  const policyData = {
    privacy: {
      title: 'Privacy Policy',
      icon: <FiShield className="text-amber-500" size={26} />,
      sections: [
        {
          heading: '1. Information We Collect',
          content: 'We collect essential details required to process uniform orders: Name, Delivery Address, PIN Code, Phone Number, and Email Address.'
        },
        {
          heading: '2. Data Usage & Encryption',
          content: 'Your data is strictly used for order processing and delivery. Online payment transactions are handled through encrypted payment gateways; we never store card numbers or PINs on our servers.'
        },
        {
          heading: '3. Third-Party Services',
          content: 'We share necessary delivery information with authorized logistics partners (e.g., Shiprocket) strictly for order fulfillment.'
        },
        {
          heading: '4. Your Rights',
          content: 'You can update or request deletion of your account information at any time through your User Profile or by contacting support.'
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      icon: <FiFileText className="text-amber-500" size={26} />,
      sections: [
        {
          heading: '1. Acceptance of Terms',
          content: 'By placing an order on The Royal Tailor uniform portal, you agree to comply with our portal guidelines and standard sales policies.'
        },
        {
          heading: '2. Uniform Specifications & Sizing',
          content: 'Custom uniform tailoring is completed according to official institutional size charts. Please verify measurement selections before submitting your order.'
        },
        {
          heading: '3. Ordering & Payments',
          content: 'Orders are confirmed upon successful payment verification. Prices displayed include applicable taxes unless specified otherwise.'
        },
        {
          heading: '4. Intellectual Property',
          content: 'All uniform badges, logos, and portal graphics are official properties of The Royal Tailor Patna.'
        }
      ]
    },
    cancellation: {
      title: 'Cancellation & Refund Policy',
      icon: <FiRefreshCw className="text-amber-500" size={26} />,
      sections: [
        {
          heading: '1. Order Cancellation Window',
          content: 'Orders can be cancelled within 12 hours of placement or before stitching/dispatch processing begins.'
        },
        {
          heading: '2. Replacements & Returns',
          content: 'Defective or incorrect size dispatches are eligible for a free replacement within 7 days of delivery.'
        },
        {
          heading: '3. Refund Processing',
          content: 'Approved refunds will be processed back to your original payment method or bank account within 5-7 business days.'
        }
      ]
    },
    shipping: {
      title: 'Shipping & Delivery Policy',
      icon: <FiTruck className="text-amber-500" size={26} />,
      sections: [
        {
          heading: '1. Dispatch Timeline',
          content: 'Standard uniform orders are dispatched within 2-4 business days. Custom tailored garments may require 5-7 business days.'
        },
        {
          heading: '2. Delivery Partners',
          content: 'Shipments across Patna, Bihar, and Pan-India are delivered via trusted logistics partners including Shiprocket and postal networks.'
        },
        {
          heading: '3. Order Tracking',
          content: 'Once shipped, an Air Waybill (AWB) tracking number will be updated under your Order Details for real-time tracking.'
        }
      ]
    }
  };

  const active = policyData[currentPolicy] || policyData.privacy;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* BACK TO MENU BUTTON */}
        <button
          type="button"
          onClick={() => navigate('/user-profile')}
          className="flex items-center gap-2 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer bg-[#18181b] border border-zinc-800 px-4 py-2.5 rounded-xl w-fit shadow-md"
        >
          <FiArrowLeft size={16} /> Back to Menu
        </button>

        {/* SINGLE POLICY HEADER */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex items-center space-x-4">
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
            {active.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide text-white">{active.title}</h1>
            <p className="text-xs text-zinc-500 mt-1">Official Policy • The Royal Tailor Patna</p>
          </div>
        </div>

        {/* SINGLE POLICY CONTENT (NO TOP TOGGLE TAB BAR) */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          {active.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2 border-b border-zinc-800/60 pb-5 last:border-b-0 last:pb-0">
              <h3 className="text-sm font-bold text-white tracking-wide">{sec.heading}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PolicyPage;