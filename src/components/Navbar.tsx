import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Search,
  User,
  RotateCcw,
  Building2,
  Menu,
  X,
  Volume2,
  VolumeX,
  BarChart3,
  ChevronDown,
  LogOut,
  Lock,
  Phone,
  Sparkles,
} from 'lucide-react';
import { User as UserType } from '../types';
import { toggleSound, isSoundEnabled, playSoftChime } from '../utils/feedback';

interface NavbarProps {
  activeTab: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login';
  setActiveTab: (tab: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login') => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onSwitchRole: () => void;
  onResetData: () => void;
  isResetting: boolean;
  onLogout: () => void;
}

interface NavItem {
  id: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onSwitchRole,
  onResetData,
  isResetting,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = Boolean(currentUser);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId: NavbarProps['activeTab']) => {
    playSoftChime('click');
    // If not logged in and clicking non-login tabs, stay on login
    if (!isLoggedIn && tabId !== 'citizen-login' && tabId !== 'admin-login') {
      setActiveTab('citizen-login');
      return;
    }
    setActiveTab(tabId);
    setAuthDropdownOpen(false);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playSoftChime('pop');
  };

  // Nav items only accessible when logged in
  const navItems: NavItem[] = [
    { id: 'map', label: 'Civic Map', icon: MapPin },
    { id: 'report', label: 'Report Issue', icon: AlertTriangle, highlight: true },
    { id: 'track', label: 'Track Status', icon: Search },
    { id: 'citizen', label: 'My Ward', icon: User },
    { id: 'admin', label: 'Admin Desk', icon: BarChart3, badge: 'Official' },
    { id: 'home', label: 'Overview', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-stone-800 shadow-xs border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => {
              if (isLoggedIn) {
                handleNavClick('map');
              } else {
                handleNavClick('citizen-login');
              }
            }}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-all">
              <MapPin className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-slate-800">
                  CivicMap
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block tracking-normal font-medium">
                Caring for our neighborhoods 🇮🇳
              </p>
            </div>
          </div>

          {/* DESKTOP VIEW: ONLY DISPLAY OPTIONS AFTER LOGIN */}
          {isLoggedIn ? (
            /* Post-Login: All options (Civic Map, Report Issue, Track Status, My Ward, Admin Desk) are displayed */
            <nav className="hidden md:flex items-center gap-1 bg-stone-50/80 p-1 rounded-2xl border border-stone-200/60 animate-in fade-in">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      item.highlight
                        ? isActive
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                          : 'bg-teal-500 hover:bg-teal-600 text-white shadow-xs'
                        : isActive
                        ? 'bg-white text-teal-800 shadow-xs border border-stone-200/80 font-bold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        item.highlight ? 'text-white' : isActive ? 'text-teal-600' : 'text-stone-400'
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Pre-Login: Options are REMOVED. Only login portal choices are displayed */
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-800 text-xs font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Login required to view Civic Map &amp; services</span>
              </div>

              <div className="flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80">
                <button
                  onClick={() => handleNavClick('citizen-login')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'citizen-login'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-teal-800 hover:bg-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Citizen Login (OTP)</span>
                </button>

                <button
                  onClick={() => handleNavClick('admin-login')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'admin-login'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-teal-900 hover:bg-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Login</span>
                </button>
              </div>
            </div>
          )}

          {/* Right Side Controls */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Gentle Sound Chime Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? 'Sound feedback enabled (click to mute)' : 'Sound feedback muted (click to unmute)'}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200/80"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            {isLoggedIn ? (
              /* User Profile & Sign Out dropdown when logged in */
              <div className="flex items-center gap-1.5">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      playSoftChime('pop');
                      setAuthDropdownOpen(!authDropdownOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-xs text-teal-900 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
                      {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <div className="text-left hidden xl:block">
                      <div className="max-w-[110px] truncate font-bold text-[11px] leading-tight">
                        {currentUser?.name}
                      </div>
                      <div className="text-[9px] text-teal-700 capitalize font-medium">
                        {currentUser?.role === 'admin' ? '🏛️ Officer' : '🏡 Citizen'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
                  </button>

                  {/* Account Dropdown Menu */}
                  {authDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-stone-100">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            Authenticated User
                          </p>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            {currentUser?.role === 'admin' ? 'Municipal Officer' : 'Citizen'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-800 mt-1">
                          {currentUser?.name}
                        </p>
                        {currentUser?.phone && (
                          <p className="text-[11px] text-stone-600 font-medium">
                            📱 +91 {currentUser.phone}
                          </p>
                        )}
                        <p className="text-[11px] text-teal-700 truncate font-medium">
                          {currentUser?.email}
                        </p>
                        {(currentUser?.ward || currentUser?.department) && (
                          <p className="text-[10px] text-stone-500 mt-0.5 truncate">
                            📍 {currentUser?.ward || currentUser?.department}
                          </p>
                        )}
                      </div>

                      <div className="p-1.5 space-y-1">
                        <button
                          onClick={() => {
                            playSoftChime('pop');
                            onSwitchRole();
                            setAuthDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl flex items-center justify-between transition-colors"
                        >
                          <span>Toggle Citizen / Admin View</span>
                          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            {currentUser?.role === 'admin' ? 'To Citizen' : 'To Officer'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            playSoftChime('pop');
                            onResetData();
                            setAuthDropdownOpen(false);
                          }}
                          disabled={isResetting}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-teal-600' : 'text-stone-400'}`} />
                          <span>Reset Demo Data</span>
                        </button>

                        <div className="pt-1 border-t border-stone-100">
                          <button
                            onClick={() => {
                              setAuthDropdownOpen(false);
                              onLogout();
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-600" />
                            <span>Sign Out &amp; Lock Portal</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct 1-click Sign Out button */}
                <button
                  onClick={onLogout}
                  title="Sign out and lock portal"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-semibold transition-colors border border-stone-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* Pre-login small reset button */
              <button
                onClick={() => {
                  playSoftChime('pop');
                  onResetData();
                }}
                disabled={isResetting}
                title="Reset database to fresh state"
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-teal-600' : ''}`} />
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!isLoggedIn ? (
              <button
                onClick={() => handleNavClick(activeTab === 'admin-login' ? 'citizen-login' : 'admin-login')}
                className="px-2.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs"
              >
                {activeTab === 'admin-login' ? 'Citizen' : 'Admin'}
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('report')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-xs"
              >
                Report
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 border-b border-stone-200 px-4 pt-2 pb-5 space-y-2 shadow-md animate-in fade-in">
          {isLoggedIn ? (
            /* Logged in: display all options */
            <>
              <div className="px-3 py-2 bg-teal-50/80 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-teal-900">{currentUser?.name}</p>
                  <p className="text-[10px] text-teal-700 capitalize font-medium">
                    {currentUser?.role === 'admin' ? '🏛️ Municipal Officer' : '🏡 Citizen Resident'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-2 py-1 rounded-lg bg-white text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavClick(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-teal-600" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    onSwitchRole();
                    setMobileMenuOpen(false);
                  }}
                  className="text-stone-700 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200"
                >
                  Switch Role
                </button>
                <button
                  onClick={() => {
                    onResetData();
                    setMobileMenuOpen(false);
                  }}
                  className="text-stone-500 hover:text-stone-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
                </button>
              </div>
            </>
          ) : (
            /* Not logged in: options removed, only login selectors shown */
            <div className="space-y-3 py-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Authentication Required</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Civic Map, reporting, and issue tracking are available after login.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleNavClick('citizen-login');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 ${
                    activeTab === 'citizen-login'
                      ? 'bg-teal-600 text-white border-teal-700'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Citizen Login (OTP)</span>
                </button>

                <button
                  onClick={() => {
                    handleNavClick('admin-login');
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 ${
                    activeTab === 'admin-login'
                      ? 'bg-teal-700 text-white border-teal-800'
                      : 'bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Admin Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
