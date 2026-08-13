import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiUser, 
  FiArrowLeft, 
  FiInfo, 
  FiCheckCircle, 
  FiShield, 
  FiSmartphone, 
  FiKey,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password / Reset Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowShowNewPassword] = useState(false);

  // OTP Auth Flow States
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [step, setStep] = useState('input'); // 'input' | 'channel_select' | 'otp_verify' | 'new_password'
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Phone typed by user
  const [selectedChannel, setSelectedChannel] = useState('sms'); // 'sms' | 'email'
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect to Home Page if already logged in
  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      navigate('/');
    }
  }, [navigate]);

  // Step 1: Request OTP (Triggers channel selection if user has both email & phone)
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');

    if (!loginIdentifier.trim()) {
      setError('Please enter your mobile number or email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/check-otp-channels`, {
        identifier: loginIdentifier
      });

      if (data.hasBoth) {
        setStep('channel_select');
      } else {
        await sendOtpToChannel(data.defaultChannel || 'email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Account not found. Please register below.');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch OTP via chosen channel
  const sendOtpToChannel = async (channel) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/send-otp`, {
        identifier: loginIdentifier,
        channel: channel
      });
      
      setSelectedChannel(channel);
      setMessage(isForgotMode 
        ? `Recovery OTP sent! Verify code to reset password.` 
        : `OTP sent! If SMS is not delivered, check your email inbox.`
      );
      setStep('otp_verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Login / Proceed to Password Reset
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/verify-otp`, {
        identifier: loginIdentifier,
        otp
      });

      if (isForgotMode) {
        setMessage('Identity verified! Please enter your new password.');
        setStep('new_password');
      } else {
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Trigger
  const handleTriggerForgotPassword = (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or mobile number first.');
      return;
    }
    setIsForgotMode(true);
    handleRequestOtp();
  };

  // Handle Setting New Password after OTP verification
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password`, {
        identifier: loginIdentifier,
        newPassword
      });

      setMessage('Password updated successfully! Please sign in with your new password.');
      setIsForgotMode(false);
      setAuthMethod('password');
      setStep('input');
      setPassword(newPassword);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Login Fallback -> Redirect to Home Page
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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Account Registration
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
      setMessage('Account created! Please verify the OTP sent to your email.');
      setTab('login');
      setStep('otp_verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. User may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Back to Store */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-amber-400 text-xs font-bold transition-all cursor-pointer z-10 bg-zinc-900/60 border border-zinc-800/80 px-4 py-2.5 rounded-xl backdrop-blur-md hover:border-amber-500/30"
      >
        <FiArrowLeft size={16} /> Back to Store
      </button>

      {/* Main Login Card */}
      <div className="bg-[#121215] border border-zinc-800/80 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-1">
            <FiShield className="text-amber-400" size={22} />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            THE ROYAL TAILOR
          </h1>
          <p className="text-[11px] text-zinc-400 font-medium tracking-wide uppercase">Official Uniform Portal • Patna, Bihar</p>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="grid grid-cols-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/80 text-xs font-bold shadow-inner">
          <button 
            onClick={() => { setTab('login'); setStep('input'); setIsForgotMode(false); setError(''); setMessage(''); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${tab === 'login' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-black' : 'text-zinc-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setTab('signup'); setIsForgotMode(false); setError(''); setMessage(''); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${tab === 'signup' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-black' : 'text-zinc-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* SMS Delivery Notice Banner */}
        <div className="bg-amber-950/30 border border-amber-500/20 p-3.5 rounded-2xl text-amber-300 text-[11px] leading-relaxed flex items-start space-x-3 shadow-sm">
          <FiInfo className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
          <span>
            <strong className="text-amber-400 font-bold">SMS Delay Notice:</strong> If the OTP code does not arrive via SMS, check your registered email inbox for instant code verification.
          </span>
        </div>

        {/* Global Error/Success Messages */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/60 p-3.5 rounded-2xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-2xl text-emerald-400 text-xs text-center font-medium flex items-center justify-center gap-2">
            <FiCheckCircle size={15} /> {message}
          </div>
        )}

        {/* ================= LOGIN TAB ================= */}
        {tab === 'login' && (
          <div className="space-y-4">
            
            {/* Step A: Identifier Input (Email or Mobile) */}
            {step === 'input' && (
              <form onSubmit={authMethod === 'otp' ? handleRequestOtp : handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                    <input 
                      type="text" 
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 9807654321 or name@gmail.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleTriggerForgotPassword}
                        className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="relative">
                      <FiLock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-12 py-3.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer uppercase tracking-wider active:scale-[0.99]"
                >
                  {loading ? 'Processing Access...' : authMethod === 'otp' ? 'Send Verification OTP' : 'Sign In To Portal'}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setAuthMethod(authMethod === 'otp' ? 'password' : 'otp'); setIsForgotMode(false); }}
                    className="text-[11px] text-zinc-400 hover:text-amber-400 transition-colors font-medium cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FiKey size={13} />
                    {authMethod === 'otp' ? 'Sign in with Password instead' : 'Sign in with 6-Digit OTP instead'}
                  </button>
                </div>
              </form>
            )}

            {/* Step B: OTP Channel Selection */}
            {step === 'channel_select' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-zinc-300 text-center font-medium">
                  Where would you like to receive your 6-digit verification code?
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => sendOtpToChannel('sms')}
                    disabled={loading}
                    className="p-4 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl text-center space-y-2 transition-all cursor-pointer group shadow-sm hover:shadow-amber-500/5"
                  >
                    <FiSmartphone size={24} className="mx-auto text-zinc-400 group-hover:text-amber-400 transition-colors" />
                    <p className="text-xs font-bold text-white">Mobile SMS</p>
                    <p className="text-[10px] text-zinc-500">Instant Phone Delivery</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendOtpToChannel('email')}
                    disabled={loading}
                    className="p-4 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl text-center space-y-2 transition-all cursor-pointer group shadow-sm hover:shadow-amber-500/5"
                  >
                    <FiMail size={24} className="mx-auto text-zinc-400 group-hover:text-amber-400 transition-colors" />
                    <p className="text-xs font-bold text-white">Email Inbox</p>
                    <p className="text-[10px] text-zinc-500">Secure Email Delivery</p>
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep('input')} 
                  className="w-full text-[11px] text-zinc-500 hover:text-white text-center pt-2 cursor-pointer transition-colors font-medium"
                >
                  ← Change Mobile / Email Identifier
                </button>
              </div>
            )}

            {/* Step C: Enter & Verify OTP */}
            {step === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3.5 text-amber-400 text-center font-mono text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                  <p className="text-[10px] text-zinc-400 text-center mt-2 font-medium">
                    Code dispatched via {selectedChannel === 'sms' ? 'Mobile SMS (Check email if SMS delayed)' : 'Email Inbox'}.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer uppercase tracking-wider active:scale-[0.99]"
                >
                  {loading ? 'Verifying Code...' : isForgotMode ? 'Verify Code to Reset Password' : 'Verify OTP & Enter Account'}
                </button>

                <div className="flex justify-between text-[11px] text-zinc-400 pt-1 font-medium">
                  <button type="button" onClick={() => sendOtpToChannel(selectedChannel)} className="hover:text-amber-400 underline transition-colors cursor-pointer">
                    Resend Code
                  </button>
                  <button type="button" onClick={() => setStep('input')} className="hover:text-amber-400 underline transition-colors cursor-pointer">
                    Change Email/Phone
                  </button>
                </div>
              </form>
            )}

            {/* Step D: Set New Password (In Forgot Password Flow) */}
            {step === 'new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                    Set New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-12 py-3.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 disabled:opacity-50 cursor-pointer uppercase tracking-wider active:scale-[0.99]"
                >
                  {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>
              </form>
            )}

          </div>
        )}

        {/* ================= REGISTER TAB ================= */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Yadav"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Mobile Number <span className="text-amber-400">* Required</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-3 text-zinc-500" size={16} />
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9870654321"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Email Address <span className="text-amber-400">* Required</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3 text-zinc-500" size={16} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-3 text-zinc-500" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-11 pr-12 py-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-zinc-500 hover:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-4 rounded-2xl transition-all text-xs shadow-lg shadow-amber-500/10 disabled:opacity-50 mt-2 cursor-pointer uppercase tracking-wider active:scale-[0.99]"
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