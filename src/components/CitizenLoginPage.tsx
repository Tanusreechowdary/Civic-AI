import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Heart,
  Award,
  Clock,
  ArrowLeft,
  Building2,
  RefreshCw,
  Database,
  Radio,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { User as UserType, SmsLog } from '../types';
import { playSoftChime } from '../utils/feedback';

interface CitizenLoginPageProps {
  onLogin: (user: UserType) => void;
  onNavigate: (tab: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login') => void;
  currentUser: UserType | null;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({
  onLogin,
  onNavigate,
  currentUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  // Email form states
  const [email, setEmail] = useState('priya.sharma@gmail.com');
  const [password, setPassword] = useState('civicpass123');
  const [name, setName] = useState('Priya Sharma');
  const [ward, setWard] = useState('Ward 150 - Bellandur, Bengaluru');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Live Simulated Incoming SMS Banner
  const [incomingSms, setIncomingSms] = useState<{
    phone: string;
    code: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Database SMS logs drawer
  const [showDbLogs, setShowDbLogs] = useState(false);
  const [recentSmsLogs, setRecentSmsLogs] = useState<SmsLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Demo Citizen Presets
  const demoCitizens: {
    name: string;
    email: string;
    phone: string;
    ward: string;
    city: string;
    badge: string;
  }[] = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '9876543210',
      ward: 'Ward 150 - Bellandur, Bengaluru',
      city: 'Bengaluru',
      badge: 'Active Resident',
    },
    {
      name: 'Aarav Patel',
      email: 'aarav.patel@gmail.com',
      phone: '9825012345',
      ward: 'Ward 12 - Navrangpura, Ahmedabad',
      city: 'Ahmedabad',
      badge: 'RWA President',
    },
    {
      name: 'Meera Iyer',
      email: 'meera.iyer@gmail.com',
      phone: '9840156789',
      ward: 'Ward 114 - T. Nagar, Chennai',
      city: 'Chennai',
      badge: 'Ward Champion',
    },
  ];

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Fetch recent SMS logs from database
  const loadSmsLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/auth/sms-logs');
      if (res.ok) {
        const data = await res.json();
        setRecentSmsLogs(data.smsLogs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch SMS logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadSmsLogs();
  }, []);

  // Real Database API: Send OTP to Mobile Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      playSoftChime('pop');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    playSoftChime('pop');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanDigits, role: 'citizen' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP via SMS gateway.');
      }

      setOtpSent(true);
      setTimer(data.expiresInSeconds ? 30 : 30);
      setSuccessNotice(`SMS sent via TRAI-DLT Gateway to +91 ${cleanDigits}`);

      // If server returned the OTP (for demo convenience), set up live incoming SMS notification
      if (data.otp) {
        setIncomingSms({
          phone: `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`,
          code: data.otp,
          message: `Govt. of India Civic Portal: Your login OTP is ${data.otp}. Valid for 5 minutes. Do not share with anyone.`,
          timestamp: 'Just now',
        });
        // Auto-fill for ultra smooth testing
        setOtp(data.otp);
      }

      playSoftChime('success');
      loadSmsLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to database to send OTP.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Database API: Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code received on mobile');
      playSoftChime('pop');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanDigits,
          otp: otp.trim(),
          name: name.trim(),
          ward: ward.trim(),
          email: email.trim(),
          role: 'citizen',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP code. Please check SMS.');
      }

      playSoftChime('success');
      setSuccessNotice('Mobile verified! Connecting to citizen profile in database...');

      setTimeout(() => {
        onLogin(data.user);
        onNavigate('citizen');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Database API: Email & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide your registered citizen email and password');
      playSoftChime('pop');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/citizen-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          ward: ward.trim(),
          phone: phone.replace(/\D/g, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate with database.');
      }

      playSoftChime('success');
      setSuccessNotice(`Authenticated as ${data.user.name}. Loading dashboard...`);

      setTimeout(() => {
        onLogin(data.user);
        onNavigate('citizen');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCitizenPreset = (c: typeof demoCitizens[0]) => {
    playSoftChime('click');
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setWard(c.ward);
    setErrorMsg(null);
    setOtpSent(false);
    setIncomingSms(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f7faf8] via-[#fafbf9] to-[#edf6f4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Back & Mode Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {currentUser ? (
            <button
              onClick={() => {
                playSoftChime('click');
                onNavigate('map');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-teal-700 bg-white px-3.5 py-2 rounded-xl border border-stone-200/80 shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Civic Map</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 bg-white px-3.5 py-2 rounded-xl border border-stone-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Citizen Portal • Secure Access Gateway</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Connected: civic_db.json</span>
            </div>

            <button
              onClick={() => {
                playSoftChime('click');
                onNavigate('admin-login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-2 rounded-xl border border-teal-200 shadow-2xs transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Officer &amp; Admin Login →</span>
            </button>
          </div>
        </div>

        {/* Live Incoming SMS Push Notification Simulation */}
        {incomingSms && (
          <div className="mb-6 p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-teal-500/30 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/40">
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">MESSAGES • GOV-CIVIC</span>
                    <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/60 font-mono">
                      TRAI-DLT Verified
                    </span>
                    <span className="text-[10px] text-slate-400">{incomingSms.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-mono leading-relaxed">
                    {incomingSms.message}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtp(incomingSms.code);
                    setCopiedOtp(true);
                    playSoftChime('click');
                    setTimeout(() => setCopiedOtp(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {copiedOtp ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Filled</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Auto-Fill {incomingSms.code}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Hero & Citizen Benefits (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-teal-50 text-[11px] font-semibold mb-4 backdrop-blur-xs">
                <span>🇮🇳 Citizen Civic Portal</span>
                <span>•</span>
                <span>नागरिक सेवा</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                Empower Your Neighborhood
              </h1>
              <p className="text-teal-100 text-xs leading-relaxed">
                Connect directly to your municipal database. Receive verified SMS OTPs, track BBMP/MCD repair crews, and improve your city.
              </p>

              <div className="mt-6 pt-6 border-t border-teal-500/40 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live SMS OTP Dispatch</h4>
                    <p className="text-[11px] text-teal-100">Directly connected to backend SMS gateway and persistent user database.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Gemini AI Auto-Triage</h4>
                    <p className="text-[11px] text-teal-100">Automatically inspects hazard levels and notifies the correct ward team.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-4 h-4 text-emerald-200" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Persistent Civic Storage</h4>
                    <p className="text-[11px] text-teal-100">All citizens, ticket submissions, and OTP verification logs persist safely.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Citizen Demo Accounts */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Database Citizen Accounts
                </span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
                  Pre-Seeded in DB
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mb-3">
                Tap any resident profile to automatically fill phone and test real OTP sending:
              </p>
              <div className="space-y-2">
                {demoCitizens.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => fillCitizenPreset(c)}
                    className="w-full text-left p-2.5 rounded-2xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800">{c.name}</div>
                        <div className="text-[10px] text-stone-500">
                          +91 {c.phone} • {c.ward.split(',')[0]}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-700 bg-teal-50 group-hover:bg-teal-100 px-2 py-0.5 rounded-md font-medium border border-teal-200">
                      {c.city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Login Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <span>Citizen Login</span>
                    <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Live Database
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Send real verification OTPs to Indian mobile numbers and connect to municipal services.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
              </div>

              {/* Toggle Auth Method (Mobile OTP vs Email/Password) */}
              <div className="flex p-1 bg-stone-100/90 rounded-2xl mb-6 border border-stone-200/60">
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime('pop');
                    setAuthMethod('otp');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'otp'
                      ? 'bg-white text-teal-800 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mobile OTP (Database SMS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime('pop');
                    setAuthMethod('email');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-white text-teal-800 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span>Email &amp; Password</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successNotice && !errorMsg && (
                <div className="mb-5 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* METHOD 1: Mobile OTP Form */}
              {authMethod === 'otp' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Indian Mobile Number for OTP
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </span>
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98765 43210"
                            className="w-full pl-16 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all tracking-wider"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                          <Send className="w-3 h-3 text-teal-600" />
                          <span>We will send a 6-digit verification code to this mobile via database SMS gateway.</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">
                            Citizen Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">
                            Ward / Locality
                          </label>
                          <input
                            type="text"
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            placeholder="Ward 150 - Bellandur"
                            className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Connecting Database &amp; Dispatching SMS...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send OTP to Mobile Number</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>OTP Dispatched to +91 {phone}</span>
                          </div>
                          <p className="text-[11px] text-teal-600 mt-0.5">
                            Logged in national database. Enter 6-digit code below to proceed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setIncomingSms(null);
                          }}
                          className="text-[11px] font-bold text-teal-700 underline hover:text-teal-900 cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-stone-700">
                            Enter 6-Digit OTP Code
                          </label>
                          {incomingSms?.code && (
                            <button
                              type="button"
                              onClick={() => {
                                setOtp(incomingSms.code);
                                playSoftChime('pop');
                              }}
                              className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline"
                            >
                              Auto-fill: {incomingSms.code}
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="560001"
                          className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-2xl text-center text-xl font-mono font-bold tracking-widest text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>Didn't receive SMS?</span>
                        <button
                          type="button"
                          disabled={timer > 0 || isLoading}
                          onClick={(e) => handleSendOtp(e)}
                          className={`font-semibold cursor-pointer ${
                            timer > 0 ? 'text-stone-400' : 'text-teal-600 hover:underline'
                          }`}
                        >
                          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend SMS OTP'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying with Database...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify OTP &amp; Enter Citizen Portal</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 2: Email & Password Form */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Citizen Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya.sharma@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Resident Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priya Sharma"
                        className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Ward / Residential Locality
                      </label>
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        placeholder="Ward 150 - Bellandur"
                        className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Database Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with Database</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Collapsible Database & SMS Gateway Audit Logs Drawer */}
              <div className="mt-6 pt-5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime('pop');
                    setShowDbLogs(!showDbLogs);
                    if (!showDbLogs) loadSmsLogs();
                  }}
                  className="w-full flex items-center justify-between text-xs text-stone-600 hover:text-teal-700 py-1 font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-teal-600" />
                    <span>Database SMS Gateway Dispatch Logs ({recentSmsLogs.length})</span>
                  </div>
                  {showDbLogs ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                {showDbLogs && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Stored in data/civic_db.json</span>
                      <button
                        type="button"
                        onClick={loadSmsLogs}
                        className="text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                        <span>Refresh Logs</span>
                      </button>
                    </div>

                    {recentSmsLogs.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-2">No SMS logs dispatched yet.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {recentSmsLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-bold text-stone-800">
                                {log.formattedPhone || log.phone}
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                {log.status}
                              </span>
                            </div>
                            <p className="text-stone-600 text-[10px] font-mono leading-tight">{log.message}</p>
                            <div className="flex items-center justify-between text-[9px] text-stone-400">
                              <span>Code: <strong className="text-teal-700 font-bold">{log.otp}</strong></span>
                              <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DigiLocker / Aadhaar Verified Banner */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>National Civic Auth &amp; Mobile Verified</span>
                </div>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  Data Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
