import { useState } from 'react';
import axios from 'axios';
import { 
  FiUser, 
  FiPackage, 
  FiSettings, 
  FiMail, 
  FiCheckCircle, 
  FiFileText, 
  FiShield, 
  FiRefreshCw, 
  FiTruck, 
  FiChevronRight,
  FiX 
} from 'react-icons/fi';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  const [activeTab, setActiveTab] = useState('edit-profile');

  // Form Fields State
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [phone, setPhone] = useState(userInfo?.phone || '');

  // UI Status State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // OTP Verification Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifyingChannel, setVerifyingChannel] = useState(''); // 'email' or 'sms'
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpStatus, setOtpStatus] = useState({ type: '', message: '' });

  // 1. SAVE PROFILE CHANGES HANDLER
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        { name, email, phone },
        config
      );

      // Save updated details into localStorage
      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. TRIGGER OTP DISPATCH HANDLER
  const handleSendVerificationOTP = async (channel) => {
    const identifier = channel === 'email' ? email : phone;
    if (!identifier) {
      alert(`Please enter a valid ${channel === 'email' ? 'Email Address' : 'Mobile Phone Number'} first.`);
      return;
    }

    setVerifyingChannel(channel);
    setOtpLoading(true);
    setOtpStatus({ type: '', message: '' });

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/send-otp`, {
        identifier,
        channel,
      });

      setOtpModalOpen(true);
      setOtpStatus({ type: 'success', message: `6-digit verification code sent to ${identifier}` });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send verification OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. VERIFY OTP CODE HANDLER
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpStatus({ type: 'error', message: 'Please enter a valid 6-digit OTP.' });
      return;
    }

    setOtpLoading(true);
    setOtpStatus({ type: '', message: '' });

    const identifier = verifyingChannel === 'email' ? email : phone;

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`, {
        identifier,
        otp: otpCode,
      });

      // Update Local Storage and State
      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setOtpModalOpen(false);
      setOtpCode('');
      setStatus({
        type: 'success',
        message: `${verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'} verified successfully!`,
      });
    } catch (error) {
      setOtpStatus({
        type: 'error',
        message: error.response?.data?.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT SUB-NAVIGATION */}
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Account</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('edit-profile')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'edit-profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="flex items-center"><FiUser className="mr-3" /> Edit Profile</span>
                <FiChevronRight />
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'orders' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="flex items-center"><FiPackage className="mr-3" /> Order History</span>
                <FiChevronRight />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="flex items-center"><FiSettings className="mr-3" /> Settings</span>
                <FiChevronRight />
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'contact' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="flex items-center"><FiMail className="mr-3" /> Contact Us</span>
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Legal Policies</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <a href="/terms" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiFileText className="mr-3" /> Terms and Conditions</span>
                <FiChevronRight />
              </a>
              <a href="/privacy" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiShield className="mr-3" /> Privacy Policy</span>
                <FiChevronRight />
              </a>
              <a href="/cancellation" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiRefreshCw className="mr-3" /> Cancellation Policy</span>
                <FiChevronRight />
              </a>
              <a href="/shipping" className="flex items-center justify-between p-2 hover:text-white transition-colors">
                <span className="flex items-center"><FiTruck className="mr-3" /> Shipping Policy</span>
                <FiChevronRight />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT EDIT PROFILE PANEL */}
        <div className="md:col-span-2">
          {activeTab === 'edit-profile' && (
            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              
              {status.message && (
                <div className={`p-4 mb-6 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-green-950/80 text-green-400 border border-green-800' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* FULL NAME */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* EMAIL ADDRESS + VERIFICATION BADGE */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                    {userInfo?.isEmailVerified ? (
                      <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center">
                        <FiCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendVerificationOTP('email')}
                        disabled={otpLoading}
                        className="text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-900 transition-colors cursor-pointer flex items-center"
                      >
                        ⚠️ Not Verified — Click to Verify
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* PHONE NUMBER + VERIFICATION BADGE */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone Number</label>
                    {userInfo?.isPhoneVerified ? (
                      <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center">
                        <FiCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendVerificationOTP('sms')}
                        disabled={otpLoading}
                        className="text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-900 transition-colors cursor-pointer flex items-center"
                      >
                        ⚠️ Not Verified — Click to Verify
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your mobile phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* SAVE CHANGES BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer text-base disabled:opacity-50 mt-4"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* OTP VERIFICATION MODAL */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Verify {verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'}</h3>
            <p className="text-xs text-zinc-400 mb-6">Enter the 6-digit verification code sent to your {verifyingChannel === 'email' ? 'Email' : 'Mobile Phone'}.</p>

            {otpStatus.message && (
              <div className={`p-3 mb-4 rounded-lg text-xs font-semibold ${otpStatus.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {otpStatus.message}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-center tracking-[0.5em] text-2xl font-mono text-white rounded-lg p-3 focus:outline-none focus:border-white"
              />

              <button 
                type="submit" 
                disabled={otpLoading}
                className="w-full bg-white text-black font-black py-3 rounded-lg hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
              >
                {otpLoading ? 'Verifying...' : 'Confirm & Verify'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;