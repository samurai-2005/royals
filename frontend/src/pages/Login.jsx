import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiPhone, FiLock, FiUser, FiArrowLeft, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'signup'
  const [tab, setTab] = useState(location.state?.tab || 'login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Auth Flow States
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [step, setStep] = useState('input'); // 'input' | 'otp_verify'
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Phone typed by user
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      navigate('/user-profile');
    }
  }, [navigate]);

  // Handle Google OAuth Trigger
  const handleGoogleAuth = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/api/users/google`;
  };

  // Step 1: Request OTP (Dispatches straight to email)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!loginIdentifier.trim()) {
      setError('Please enter your mobile number or email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/send-otp`, {
        identifier: loginIdentifier
      });

      setMessage('Verification OTP dispatched to your registered email inbox.');
      setStep('otp_verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Account not found. Please register below.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`, {
        identifier: loginIdentifier,
        otp
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/user-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Password Login Fallback
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {
        email: loginIdentifier,
        password
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/user-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email/phone or password.');
    } finally {
      setLoading(false);
    }
  };

  // Account Registration (Requires BOTH Mobile & Email)
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !email) {
      setError('Both Mobile Number and Email Address are strictly required to create an account.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
        name,
        email,
        phone,
        password
      });

      setLoginIdentifier(email);
      setMessage('Account created! Verification OTP sent to your registered email.');
      setTab('login');
      setStep('otp_verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. User may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col justify-center items-center p-4 relative">
      
      {/* Back to Shop */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <FiArrowLeft size={16} /> Back to Shop
      </button>

      <div className="bg-[#18181b] border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
        
        {/* Branding Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-wider uppercase">THE ROYAL TAILOR</h1>
          <p className="text-xs text-zinc-400 mt-1">Official Uniform Portal • Patna, Bihar</p>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
          <button 
            onClick={() => { setTab('login'); setStep('input'); setError(''); setMessage(''); }}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${tab === 'login' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setTab('signup'); setError(''); setMessage(''); }}
            className={`py-2 rounded-lg transition-colors cursor-pointer ${tab === 'signup' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* Temporary Mobile SMS Notice Banner */}
        <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start space-x-2.5">
          <FiInfo className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
          <span>
            <strong>SMS Notice:</strong> If the OTP is not coming to your mobile number, please check your registered email inbox for the OTP to verify.
          </span>
        </div>

        {/* Global Error/Success Messages */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-950/40 border border-green-800/60 p-3 rounded-xl text-green-400 text-xs text-center font-medium flex items-center justify-center gap-2">
            <FiCheckCircle size={14} /> {message}
          </div>
        )}

        {/* Social Google Auth Option */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-3 cursor-pointer"
        >
          <FcGoogle size={18} /> Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full"></div>
          <span className="bg-[#18181b] px-3 text-[10px] font-bold uppercase text-zinc-500 relative">Or with credentials</span>
        </div>

        {/* ================= LOGIN TAB ================= */}
        {tab === 'login' && (
          <div className="space-y-4">
            
            {/* Step A: Identifier Input (Email or Mobile) */}
            {step === 'input' && (
              <form onSubmit={authMethod === 'otp' ? handleRequestOtp : handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                    <input 
                      type="text" 
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 9304566723 or name@gmail.com"
                      className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-colors text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : authMethod === 'otp' ? 'Send Verification OTP' : 'Sign In'}
                </button>

                <div className="text-center pt-1">
                  <button 
                    type="button" 
                    onClick={() => setAuthMethod(authMethod === 'otp' ? 'password' : 'otp')}
                    className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    {authMethod === 'otp' ? 'Sign in with Password instead' : 'Sign in with 6-Digit OTP instead'}
                  </button>
                </div>
              </form>
            )}

            {/* Step B: Enter & Verify OTP */}
            {step === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-400 text-center mt-2">
                    Code dispatched to your registered email inbox.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-zinc-200 transition-colors text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Access Account'}
                </button>

                <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
                  <button type="button" onClick={handleRequestOtp} className="hover:text-white underline cursor-pointer">
                    Resend Email OTP
                  </button>
                  <button type="button" onClick={() => setStep('input')} className="hover:text-white underline cursor-pointer">
                    Change Email/Phone
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* ================= REGISTER TAB ================= */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-amber-500">* Required</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9304566723"
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Email Address <span className="text-amber-500">* Required</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Account Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#0f0f0f] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 transition-colors text-xs shadow-md disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Verified Account'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;