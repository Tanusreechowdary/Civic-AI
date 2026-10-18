import React, { useState } from 'react';
import { User, Shield, Lock, Mail, Building2, CheckCircle2, X } from 'lucide-react';
import { User as UserType } from '../types';
import { playSoftChime } from '../utils/feedback';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogin: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handle1ClickLogin = async (userRole: 'citizen' | 'admin') => {
    playSoftChime('pop');
    try {
      const endpoint = userRole === 'admin' ? '/api/auth/admin-login' : '/api/auth/citizen-login';
      const body =
        userRole === 'admin'
          ? {
              email: 'commissioner@civicmap.gov.in',
              name: 'Commissioner Dr. K. Radhakrishnan',
              badgeId: 'KA-BBMP-ADM-01',
              department: 'Central Municipal Administration & Urban Development',
              corporation: 'BBMP',
            }
          : {
              email: 'priya.sharma@gmail.com',
              name: 'Priya Sharma',
              ward: 'Ward 150 - Bellandur, Bengaluru',
              phone: '9876543210',
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.user);
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Fallback local user login:', err);
    }

    if (userRole === 'admin') {
      onLogin({
        id: 'adm-001',
        name: 'Commissioner Dr. K. Radhakrishnan',
        email: 'commissioner@civicmap.gov.in',
        role: 'admin',
        department: 'Central Municipal Administration & Urban Development, India',
        createdAt: new Date().toISOString(),
      });
    } else {
      onLogin({
        id: 'cit-001',
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        role: 'citizen',
        ward: 'Ward 150 - Bellandur, Bengaluru',
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const endpoint = role === 'admin' ? '/api/auth/admin-login' : '/api/auth/citizen-login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playSoftChime('success');
        onLogin(data.user);
        onClose();
        return;
      }
    } catch (err) {
      console.warn('Backend login fallback:', err);
    }

    playSoftChime('success');
    onLogin({
      id: `${role.substring(0, 3)}-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
      ward: 'Ward 150 - Bengaluru, India',
      department: role === 'admin' ? 'BBMP Road Infrastructure & Public Works' : undefined,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Light & Soft Header */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 border-b border-stone-200/70 p-6 flex items-center justify-between text-stone-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200 shadow-2xs">
              India Civic Identity Portal 🇮🇳
            </span>
            <h3 className="font-extrabold text-xl text-stone-900 mt-1">
              {mode === 'login' ? 'Sign In to CivicMap AI' : 'Register Citizen Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Fast Login Personas */}
        <div className="p-6 bg-stone-50/60 border-b border-stone-200/70 space-y-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
            ⚡ 1-Click Demo Personas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handle1ClickLogin('citizen')}
              className="p-3 rounded-2xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-left transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-teal-900 font-bold text-xs">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Priya Sharma</span>
              </div>
              <span className="text-[10px] text-teal-700 block mt-0.5">Citizen (Bengaluru)</span>
            </button>

            <button
              onClick={() => handle1ClickLogin('admin')}
              className="p-3 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-left transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Dr. Radhakrishnan</span>
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">Admin Commissioner</span>
            </button>
          </div>
        </div>

        {/* Regular Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Role selector */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  role === 'citizen'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500/30'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  role === 'admin'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
              >
                Municipal Admin
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. priya.sharma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              {mode === 'login'
                ? "Don't have an account yet? Register here"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
