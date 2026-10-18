import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Heart,
  Smile,
  Sliders,
  Check,
  User,
} from 'lucide-react';
import { StatsSummary } from '../types';
import { playSoftChime } from '../utils/feedback';

interface HomeHeroProps {
  stats: StatsSummary | null;
  onNavigate: (tab: 'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login') => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ stats, onNavigate }) => {
  const [activeBeforeAfter, setActiveBeforeAfter] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100

  const showcaseItems = [
    {
      title: 'Outer Ring Road Pothole Compaction',
      location: 'Outer Ring Road, Bellandur, Ward 150, Bengaluru',
      department: 'BBMP Road Infrastructure & Public Works',
      daysToResolve: '1.5 days',
      beforeImg: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      description: 'Dangerous 10-inch deep road cavity near EcoSpace filled with hot-mix asphalt and compacted with heavy rollers.',
      citizenNote: '"Vehicles can now travel smoothly without swerving into oncoming traffic!" — Priya S.',
    },
    {
      title: 'High-Mast Streetlight Luminaire Replacement',
      location: 'Linking Road, Bandra West, Ward H/W, Mumbai',
      department: 'BESCOM / BSES Urban Electrical & Lighting Board',
      daysToResolve: '2.0 days',
      beforeImg: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
      description: 'Damaged streetlight pole stabilized, safety brackets secured, and energy-saving 65W LED luminaire verified functional.',
      citizenNote: '"The pedestrian crossing is finally bright and safe for evening market shoppers." — Ananya I.',
    },
  ];

  const currentShowcase = showcaseItems[activeBeforeAfter];

  const handleNav = (tab: any) => {
    playSoftChime('click');
    onNavigate(tab);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Light & Soft Welcoming Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef8f5] via-[#f7faf8] to-[#fafbf9] text-stone-800 pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-100/60">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-200/30 to-emerald-200/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-4 right-10 w-72 h-72 bg-amber-100/40 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          {/* Friendly Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-teal-800 border border-teal-200/80 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Serving Citizens Across India 🇮🇳</span>
            <span className="text-stone-300">•</span>
            <span className="text-teal-700 font-bold">AI Smart City Grid</span>
          </div>

          {/* Warm, Inspiring Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-[1.15]">
            Building Smarter Communities, <br />
            <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
              One Report at a Time.
            </span>
          </h1>

          {/* Approachable, Caring Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
            Spot a pothole, overflowing garbage, broken streetlight, or leaking pipeline?
            Drop a pin on our map with a photo. Our smart AI analyzes urgency, prevents duplicate tickets,
            and routes it directly to your municipal team.
          </p>

          {/* Soft Interactive Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleNav('report')}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-700/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <AlertTriangle className="w-4 h-4 text-teal-100" />
              <span>Report an Issue</span>
            </button>

            <button
              onClick={() => handleNav('map')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm border border-stone-200/90 shadow-xs flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Explore Civic Map</span>
            </button>

            <button
              onClick={() => handleNav('track')}
              className="px-6 py-3 rounded-2xl bg-stone-100/80 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm border border-stone-200/80 flex items-center gap-2 transition-all"
            >
              <Search className="w-4 h-4 text-stone-400" />
              <span>Track Complaint</span>
            </button>
          </div>

          {/* Dedicated Login Portals Entry */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleNav('citizen-login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100/90 text-teal-800 border border-teal-200/90 text-xs font-semibold shadow-2xs transition-all group hover:scale-[1.02]"
            >
              <User className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span>Citizen Portal Login</span>
              <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200 font-bold">
                Mobile OTP
              </span>
            </button>

            <button
              onClick={() => handleNav('admin-login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold shadow-2xs transition-all group hover:scale-[1.02]"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Municipal Officer Login</span>
              <span className="text-[10px] text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 font-bold">
                ULB Staff
              </span>
            </button>
          </div>
        </div>

        {/* Soft, Friendly KPI Cards */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-4 text-center soft-card">
            <div className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
              <span>Total Reported</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              {stats?.total ?? 12}
            </div>
            <span className="text-[11px] text-teal-700 font-medium">From local citizens</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-amber-200/70 rounded-2xl p-4 text-center soft-card">
            <div className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1">
              <span>Under Review</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {stats?.submitted ?? 3}
            </div>
            <span className="text-[11px] text-amber-700/80 font-medium">Assigned to field staff</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-sky-200/70 rounded-2xl p-4 text-center soft-card">
            <div className="text-xs text-sky-700 font-medium flex items-center justify-center gap-1">
              <span>In Progress</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">
              {stats?.inProgress ?? 4}
            </div>
            <span className="text-[11px] text-sky-700/80 font-medium">Repair crew on site</span>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-emerald-200/70 rounded-2xl p-4 text-center soft-card">
            <div className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1">
              <span>Resolved &amp; Fixed</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {stats?.resolved ?? 5}
            </div>
            <span className="text-[11px] text-emerald-700/80 font-medium">Verified with photos</span>
          </div>
        </div>
      </section>

      {/* How CivicMap AI Works - Friendly 4-Step Journey */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1.5">
            Transparent, compassionate civic resolution connecting everyday residents with municipal teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: 'Step 1',
              title: 'Snap & Pin',
              desc: 'Take a photo of the road damage, garbage, or water leak. The map detects your street location automatically.',
              icon: MapPin,
              color: 'bg-teal-100 text-teal-700',
            },
            {
              step: 'Step 2',
              title: 'AI Smart Triage',
              desc: 'Our AI classifies the problem, estimates urgency level (Critical to Routine), and identifies the responsible department.',
              icon: Sparkles,
              color: 'bg-emerald-100 text-emerald-700',
            },
            {
              step: 'Step 3',
              title: 'Duplicate Shield',
              desc: 'If neighbors already reported the same pothole within 300 meters, it combines your report to escalate priority.',
              icon: Shield,
              color: 'bg-amber-100 text-amber-700',
            },
            {
              step: 'Step 4',
              title: 'Fixed & Verified',
              desc: 'The repair team resolves the issue and uploads a clear "After" photograph so everyone can verify completion.',
              icon: CheckCircle2,
              color: 'bg-sky-100 text-sky-700',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all soft-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {item.step}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center font-bold`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-slate-800 mb-1.5">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Before & After Resolution Showcase with Slider */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#f8faf9] to-[#edf7f4] rounded-3xl p-6 sm:p-10 border border-teal-200/70 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
                Community Impact
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2">
                Real Neighborhood Fixes: Before &amp; After
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Drag the interactive slider below to inspect the verified repair quality!
              </p>
            </div>

            {/* Case selector pills */}
            <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-stone-200">
              {showcaseItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playSoftChime('pop');
                    setActiveBeforeAfter(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeBeforeAfter === idx
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Case #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Split-Screen Image Comparison */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-4">
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden select-none bg-stone-100">
              {/* After image (background layer) */}
              <img
                src={currentShowcase.afterImg}
                alt="After repair"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                ✓ AFTER: Verified Fixed
              </span>

              {/* Before image (clipped layer) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={currentShowcase.beforeImg}
                  alt="Before repair"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                <span className="absolute bottom-3 left-3 bg-rose-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                  ⚠️ BEFORE: Incident Reported
                </span>
              </div>

              {/* Slider divider line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-md flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-teal-700 shadow-md flex items-center justify-center text-xs font-bold border border-teal-200">
                  ↔
                </div>
              </div>
            </div>

            {/* Slider Control Bar */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-xs font-bold text-rose-700">Before</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-bold text-emerald-700">After</span>
            </div>

            {/* Case Details & Citizen Note */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
              <div>
                <strong className="text-slate-800 text-sm">{currentShowcase.title}</strong>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  📍 {currentShowcase.location} • Handled by {currentShowcase.department}
                </p>
                <p className="text-teal-800 text-[11px] italic mt-1 font-medium">
                  {currentShowcase.citizenNote}
                </p>
              </div>

              <button
                onClick={() => handleNav('map')}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 font-bold border border-teal-200 flex items-center gap-1.5 transition-colors self-end sm:self-center"
              >
                <span>View on Civic Map</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
