import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  BarChart3,
  Layers,
  ArrowLeft,
  User,
  KeyRound,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Phone,
  Send,
  Radio,
  Database,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { User as UserType } from '../types';
import { playSoftChime } from '../utils/feedback';

interface AdminLoginPageProps {
  onLogin: (user: UserType) => void;
  onNavigate: (tab: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login') => void;
  currentUser: UserType | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLogin,
  onNavigate,
  currentUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'mobile_otp'>('credentials');

  // Official Credentials Form
  const [email, setEmail] = useState('commissioner@civicmap.gov.in');
  const [password, setPassword] = useState('govadmin2026');
  const [department, setDepartment] = useState('Central Municipal Administration & Urban Development');
  const [corporation, setCorporation] = useState('BBMP - Bruhat Bengaluru Mahanagara Palike');
  const [badgeId, setBadgeId] = useState('KA-BBMP-ADM-01');
  const [name, setName] = useState('Dr. K. Radhakrishnan');

  // Officer Mobile OTP Form
  const [officerPhone, setOfficerPhone] = useState('9800011122');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  // Feedback and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Incoming SMS simulation for Officer mobile OTP
  const [incomingSms, setIncomingSms] = useState<{
    phone: string;
    code: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Demo Officer Presets from Database
  const demoOfficers: {
    name: string;
    email: string;
    phone: string;
    badgeId: string;
    department: string;
    corporation: string;
    roleTitle: string;
    desc: string;
  }[] = [
    {
      name: 'Dr. K. Radhakrishnan',
      email: 'commissioner@civicmap.gov.in',
      phone: '9800011122',
      badgeId: 'KA-BBMP-ADM-01',
      department: 'Central Municipal Administration & Urban Development',
      corporation: 'BBMP - Bruhat Bengaluru Mahanagara Palike',
      roleTitle: 'Municipal Commissioner',
      desc: 'Full administrative access, SLA overrides, duplicate audit, and cross-department triage.',
    },
    {
      name: 'Manoj Patil',
      email: 'manoj.patil@bbmp.gov.in',
      phone: '9800033344',
      badgeId: 'KA-BBMP-ENG-42',
      department: 'Roads & Infrastructure Department',
      corporation: 'BBMP - Bruhat Bengaluru Mahanagara Palike',
      roleTitle: 'Field Junior Engineer (Ward 150)',
      desc: 'Dispatch asphalt repair crews, verify pothole repair photos, and update SLA work orders.',
    },
    {
      name: 'Dr. Sunita Verma',
      email: 'sunita.verma@mcd.gov.in',
      phone: '9800055566',
      badgeId: 'DL-MCD-SWM-18',
      department: 'Solid Waste Management & Sanitation',
      corporation: 'MCD - Municipal Corporation of Delhi',
      roleTitle: 'Sanitation Zonal Supervisor',
      desc: 'Assign tipper trucks to overflowing garbage dumps, monitor green bin disposal.',
    },
  ];

  // Database API: Officer Credentials Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your official email and municipal security PIN');
      playSoftChime('pop');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          badgeId: badgeId.trim(),
          department,
          corporation,
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Municipal credential verification failed.');
      }

      playSoftChime('success');
      setSuccessNotice(`Welcome, Officer ${data.user.name}. Opening Municipal Command Desk...`);

      setTimeout(() => {
        onLogin(data.user);
        onNavigate('admin');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to database.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  // Database API: Officer Mobile Send OTP
  const handleOfficerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = officerPhone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit registered officer mobile number');
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
        body: JSON.stringify({ phone: cleanDigits, role: 'admin' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch officer OTP.');
      }

      setOtpSent(true);
      setTimer(30);
      setSuccessNotice(`Official OTP sent via secure SMS to +91 ${cleanDigits}`);

      if (data.otp) {
        setIncomingSms({
          phone: `+91 ${cleanDigits}`,
          code: data.otp,
          message: `Govt. of India Officer Auth: Your secure login OTP is ${data.otp}. Valid for 5 mins. Restricted official use.`,
          timestamp: 'Just now',
        });
        setOtp(data.otp);
      }

      playSoftChime('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending officer OTP.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  // Database API: Officer Verify OTP
  const handleOfficerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setErrorMsg('Please enter the verification code sent to your officer phone');
      playSoftChime('pop');
      return;
    }

    const cleanDigits = officerPhone.replace(/\D/g, '');
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
          ward: 'Zone Headquarters',
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP code.');
      }

      playSoftChime('success');
      setSuccessNotice(`Officer ${data.user.name} authenticated. Loading command desk...`);

      setTimeout(() => {
        onLogin(data.user);
        onNavigate('admin');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Officer OTP verification failed.');
      playSoftChime('pop');
    } finally {
      setIsLoading(false);
    }
  };

  const fillOfficerPreset = (officer: typeof demoOfficers[0]) => {
    playSoftChime('click');
    setName(officer.name);
    setEmail(officer.email);
    setOfficerPhone(officer.phone);
    setBadgeId(officer.badgeId);
    setDepartment(officer.department);
    setCorporation(officer.corporation);
    setErrorMsg(null);
    setOtpSent(false);
    setIncomingSms(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f4f7f6] via-[#fafbf9] to-[#edf3f1] py-10 px-4 sm:px-6 lg:px-8">
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
              <span>Municipal Operations • Official Access Gateway</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Municipal Database Connected</span>
            </div>

            <button
              onClick={() => {
                playSoftChime('click');
                onNavigate('citizen-login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3.5 py-2 rounded-xl border border-teal-200 shadow-2xs transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Citizen Login Portal →</span>
            </button>
          </div>
        </div>

        {/* Live Incoming SMS Simulation for Officer OTP */}
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
                    <span className="text-xs font-bold text-white tracking-wide">MESSAGES • NIC-OFFICER-SMS</span>
                    <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/60 font-mono">
                      Govt. Secure Channel
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
          {/* Left Hero & Admin Command Benefits (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 via-[#1b3b3a] to-teal-800 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-[11px] font-semibold mb-4 backdrop-blur-xs border border-white/10">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Municipal Authority &amp; Field Staff</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                Urban Governance Command
              </h1>
              <p className="text-teal-100/90 text-xs leading-relaxed">
                Official portal for Bruhat Bengaluru Mahanagara Palike (BBMP), MCD, and partner municipal corporations. Authenticated against the national civic database.
              </p>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Database className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Database Authority</h4>
                    <p className="text-[11px] text-teal-100/80">SLA updates, status audits, and crew assignments persist to civic_db.json.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Officer Mobile OTP Verification</h4>
                    <p className="text-[11px] text-teal-100/80">Support for multi-factor OTP sent to registered municipal officer SIMs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Photo Verification Audit</h4>
                    <p className="text-[11px] text-teal-100/80">Verify post-repair luminaire, asphalt, and drain desilting before closing tickets.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Officer Presets from Database */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Pre-Seeded Officers in DB
                </span>
                <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-semibold border border-teal-200">
                  Select to Test
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mb-3">
                Select an official profile to auto-fill credentials and test database authentication:
              </p>
              <div className="space-y-2.5">
                {demoOfficers.map((o) => (
                  <button
                    key={o.badgeId}
                    type="button"
                    onClick={() => fillOfficerPreset(o)}
                    className="w-full text-left p-3 rounded-2xl border border-stone-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex flex-col gap-1 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-stone-800 group-hover:text-teal-800 transition-colors">
                        {o.name}
                      </div>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 group-hover:bg-teal-100 px-2 py-0.5 rounded font-semibold border border-teal-200">
                        {o.badgeId}
                      </span>
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium">{o.roleTitle}</div>
                    <div className="text-[10px] text-stone-400">Mobile: +91 {o.phone}</div>
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
                    <span>Officer Authentication</span>
                    <span className="text-xs font-normal text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Govt. of India
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Connect to municipal backend with official credentials or mobile OTP.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200 shadow-2xs">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              {/* Toggle Auth Method (Official Credentials vs Officer Mobile OTP) */}
              <div className="flex p-1 bg-stone-100/90 rounded-2xl mb-6 border border-stone-200/60">
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime('pop');
                    setAuthMethod('credentials');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'credentials'
                      ? 'bg-white text-teal-800 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Official PIN &amp; Badge</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime('pop');
                    setAuthMethod('mobile_otp');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'mobile_otp'
                      ? 'bg-white text-teal-800 shadow-xs border border-stone-200/80'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Officer Mobile OTP</span>
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

              {/* METHOD 1: Official Credentials Form */}
              {authMethod === 'credentials' && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Municipal Corporation (ULB)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <select
                        value={corporation}
                        onChange={(e) => setCorporation(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
                      >
                        <option value="BBMP - Bruhat Bengaluru Mahanagara Palike">
                          BBMP - Bruhat Bengaluru Mahanagara Palike
                        </option>
                        <option value="MCD - Municipal Corporation of Delhi">
                          MCD - Municipal Corporation of Delhi
                        </option>
                        <option value="BMC - Brihanmumbai Municipal Corporation">
                          BMC - Brihanmumbai Municipal Corporation
                        </option>
                        <option value="GHMC - Greater Hyderabad Municipal Corporation">
                          GHMC - Greater Hyderabad Municipal Corporation
                        </option>
                        <option value="GCC - Greater Chennai Corporation">
                          GCC - Greater Chennai Corporation
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Official Gov Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer@bbmp.gov.in"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Officer Badge ID
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={badgeId}
                          onChange={(e) => setBadgeId(e.target.value)}
                          placeholder="KA-BBMP-ENG-42"
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all uppercase"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Municipal Security PIN / Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Roads & Infrastructure"
                        className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Officer Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. K. Radhakrishnan"
                        className="w-full px-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-sm shadow-teal-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Municipal Credentials in DB...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Sign In to Admin Command Desk</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* METHOD 2: Officer Mobile OTP Form */}
              {authMethod === 'mobile_otp' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleOfficerSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Officer Registered Mobile Number
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
                            value={officerPhone}
                            onChange={(e) => setOfficerPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98000 11122"
                            className="w-full pl-16 pr-4 py-2.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all tracking-wider"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                          <Send className="w-3 h-3 text-teal-600" />
                          <span>Dispatches authenticated officer OTP via database SMS gateway.</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-sm shadow-teal-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sending Secure Officer OTP...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send OTP to Officer Phone</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOfficerVerifyOtp} className="space-y-4">
                      <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>OTP Dispatched to +91 {officerPhone}</span>
                          </div>
                          <p className="text-[11px] text-teal-600 mt-0.5">
                            Logged in national database. Enter 6-digit code to access administrative console.
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
                            Enter 6-Digit Officer Code
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
                          className="w-full px-4 py-3 bg-stone-50/70 border border-stone-200 rounded-2xl text-center text-xl font-mono font-bold tracking-widest text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>Didn't receive SMS?</span>
                        <button
                          type="button"
                          disabled={timer > 0 || isLoading}
                          onClick={(e) => handleOfficerSendOtp(e)}
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
                        className="w-full py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-sm shadow-teal-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Officer Privileges...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify &amp; Unlock Admin Desk</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Security Seals */}
              <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>National Municipal Authority Certified</span>
                </div>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                  Audit Logged
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
