import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiX,
  FiCamera
} from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || {});
  
  // Section Navigation: 'menu' | 'edit-profile'
  const [view, setView] = useState('menu');

  // Customer Profile Form State
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

      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
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
      setOtpStatus({ type: 'success', message: '6-digit verification code sent to your registered email' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send verification OTP.');
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

      const updatedUserInfo = { ...userInfo, ...data, token: userInfo.token };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);

      setOtpModalOpen(false);
      setOtpCode('');
      setStatus({
        type: 'success',
        message: `${verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'} verified successfully!`,
      });
    } catch (err) {
      setOtpStatus({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-10 flex flex-col justify-center items-center relative">
      <div className="max-w-xl w-full space-y-6">
        
        {/* USER PROFILE HEADER CARD */}
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-6 shadow-2xl space-y-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            
            {/* AVATAR WITH CAMERA BADGE */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-red-950/60 border-2 border-red-800/80 overflow-hidden flex items-center justify-center shadow-lg">
                {userInfo?.profilePicture ? (
                  <img src={userInfo.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-amber-500 uppercase">{userInfo?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <button 
                type="button"
                className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                title="Change Avatar"
              >
                <FiCamera size={14} />
              </button>
            </div>

            {/* USER INFO & ADMIN BADGE */}
            <div className="space-y-1.5 flex-1">
              <h1 className="text-2xl font-black tracking-wide text-white">{userInfo?.name || 'User Profile'}</h1>
              <p className="text-xs text-zinc-400 font-medium">{userInfo?.email || 'No email provided'}</p>

              {userInfo?.isAdmin && (
                <div className="pt-1">
                  <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full shadow-sm">
                    <FiShield className="mr-1.5" size={12} /> Administrator
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* OPEN ADMIN DASHBOARD ORANGE CTA BUTTON */}
          {userInfo?.isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-6 rounded-xl flex items-center justify-between shadow-xl transition-all cursor-pointer group"
            >
              <span className="flex items-center text-sm tracking-wide">
                <FiShield className="mr-3" size={18} /> Open Admin Dashboard
              </span>
              <FiChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* PROFILE SECTIONS / EDIT VIEW TOGGLE */}
        {view === 'menu' ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* ACCOUNT SECTION */}
            <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Account</h3>
              
              <div className="space-y-1 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setView('edit-profile')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center"><FiUser className="mr-3.5 text-zinc-400" size={18} /> Edit Profile</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center"><FiPackage className="mr-3.5 text-zinc-400" size={18} /> Order History</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => setView('edit-profile')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center"><FiSettings className="mr-3.5 text-zinc-400" size={18} /> Settings</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <span className="flex items-center"><FiMail className="mr-3.5 text-zinc-400" size={18} /> Contact Us</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* LEGAL POLICIES SECTION */}
            <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Legal Policies</h3>
              
              <div className="space-y-1 text-sm font-semibold">
                <button 
                  type="button"
                  onClick={() => navigate('/terms-and-conditions')} 
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center"><FiFileText className="mr-3.5 text-zinc-400" size={18} /> Terms and Conditions</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/privacy-policy')} 
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center"><FiShield className="mr-3.5 text-zinc-400" size={18} /> Privacy Policy</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/refund-policy')} 
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center"><FiRefreshCw className="mr-3.5 text-zinc-400" size={18} /> Cancellation Policy</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>

                <button 
                  type="button"
                  onClick={() => navigate('/shipping-policy')} 
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center"><FiTruck className="mr-3.5 text-zinc-400" size={18} /> Shipping Policy</span>
                  <FiChevronRight className="text-zinc-500" />
                </button>
              </div>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 text-red-400 font-bold py-3.5 rounded-2xl transition-colors text-xs shadow-md cursor-pointer"
            >
              Secure Logout
            </button>

          </div>
        ) : (
          /* EDIT PROFILE INLINE FORM */
          <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl animate-fade-in space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-black text-white">Edit Profile Details</h2>
              <button 
                type="button" 
                onClick={() => setView('menu')}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Back to Menu
              </button>
            </div>

            {status.message && (
              <div className={`p-4 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-green-950/80 text-green-400 border border-green-800' : 'bg-red-950/80 text-red-400 border border-red-800'}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
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
                  placeholder="Enter your 10-digit mobile phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {/* SAVE CHANGES BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer text-base disabled:opacity-50 mt-2"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* OTP VERIFICATION MODAL */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              type="button"
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Verify {verifyingChannel === 'email' ? 'Email Address' : 'Mobile Phone'}</h3>
            <p className="text-xs text-zinc-400 mb-6">Enter the 6-digit verification code sent to your registered email.</p>

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