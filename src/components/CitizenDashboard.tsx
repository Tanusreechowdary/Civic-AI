import React, { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ExternalLink,
  ThumbsUp,
  Sparkles,
  ShieldCheck,
  Share2,
  Heart,
  Award,
} from 'lucide-react';
import { Complaint, User as UserType } from '../types';
import { playSoftChime } from '../utils/feedback';

interface CitizenDashboardProps {
  complaints: Complaint[];
  currentUser: UserType | null;
  onNavigateToReport: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onNavigateToLogin?: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  complaints,
  currentUser,
  onNavigateToReport,
  onSelectComplaint,
  onNavigateToLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'my_reports' | 'all_community'>('my_reports');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter complaints based on tab and filters
  const myComplaints = complaints.filter(
    (c) =>
      c.userId === currentUser?.id ||
      c.userEmail.toLowerCase() === (currentUser?.email || '').toLowerCase() ||
      c.userName === currentUser?.name
  );

  const displayedList = (activeTab === 'my_reports' ? myComplaints : complaints).filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const myResolvedCount = myComplaints.filter((c) => c.status === 'resolved').length;
  const myPendingCount = myComplaints.filter((c) => c.status !== 'resolved').length;

  const handleShareToWhatsApp = (comp: Complaint, e: React.MouseEvent) => {
    e.stopPropagation();
    playSoftChime('click');
    const text = encodeURIComponent(
      `🚨 Check out this civic issue reported on CivicMap AI:\n` +
      `Ticket: [${comp.id}] ${comp.title}\n` +
      `Location: ${comp.address}\n` +
      `Status: ${comp.status.replace('_', ' ').toUpperCase()}\n` +
      `Department: ${comp.department}\n` +
      `Let's help our neighborhood stay clean and safe!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Light & Soft Citizen Profile Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 rounded-3xl p-6 sm:p-8 text-stone-800 border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm shadow-teal-600/30">
            {currentUser?.name ? currentUser.name.charAt(0) : 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                {currentUser?.name || 'Priya Sharma'}
              </h1>
              <span className="text-[10px] font-bold bg-white text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Award className="w-3 h-3 text-amber-500" />
                <span>Verified Citizen 🇮🇳</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              📧 {currentUser?.email || 'priya.sharma@gmail.com'} • 📍 {currentUser?.ward || 'Ward 150 - Bellandur, Bengaluru'}
            </p>
          </div>
        </div>

        {/* Quick Report & Switch Citizen Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToLogin && (
            <button
              onClick={() => {
                playSoftChime('click');
                onNavigateToLogin();
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs border border-stone-200/90 shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Switch / Login</span>
            </button>
          )}
          <button
            onClick={() => {
              playSoftChime('click');
              onNavigateToReport();
            }}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Civic Issue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards in Soft Pastel Colors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs soft-card">
          <span className="text-xs text-stone-500 font-medium">My Total Reports</span>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">{myComplaints.length}</div>
          <span className="text-[10px] text-teal-700 font-semibold">Active in your ward</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/70 shadow-2xs soft-card">
          <span className="text-xs text-amber-800 font-medium">Under Action</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{myPendingCount}</div>
          <span className="text-[10px] text-amber-700/80 font-medium">With municipal teams</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/70 shadow-2xs soft-card">
          <span className="text-xs text-emerald-800 font-medium">Resolved &amp; Fixed</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{myResolvedCount}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Community impact verified</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-teal-200/70 shadow-2xs soft-card">
          <span className="text-xs text-teal-800 font-medium">Citizen Impact Rank</span>
          <div className="text-lg font-extrabold text-teal-700 mt-1 flex items-center gap-1">
            <span>Level 2</span>
            <span className="text-xs font-normal text-stone-400">Champion</span>
          </div>
          <span className="text-[10px] text-teal-600 font-medium">Top 5% in Ward 150</span>
        </div>
      </div>

      {/* Main List & Controls */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/70">
            <button
              onClick={() => {
                playSoftChime('click');
                setActiveTab('my_reports');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'my_reports'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              My Reported Issues ({myComplaints.length})
            </button>
            <button
              onClick={() => {
                playSoftChime('click');
                setActiveTab('all_community');
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all_community'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Community Issues ({complaints.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200/80 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 mr-1">Filter Status:</span>
          {['all', 'submitted', 'under_review', 'assigned', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => {
                playSoftChime('pop');
                setFilterStatus(st);
              }}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                filterStatus === st
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        {displayedList.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-700">No complaints found</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              There are no matching complaints under this filter. Tap "Report New Civic Issue" to alert your local municipality!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedList.map((comp) => {
              const isResolved = comp.status === 'resolved';
              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    playSoftChime('click');
                    onSelectComplaint(comp);
                  }}
                  className="p-4 rounded-2xl border border-stone-200/80 hover:border-teal-300 hover:bg-stone-50/50 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 soft-card"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {comp.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          comp.priority === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : comp.priority === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {comp.priority.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {isResolved ? 'Resolved ✓' : comp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900">{comp.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate max-w-xs">{comp.address}</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions & Upvotes */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => handleShareToWhatsApp(comp, e)}
                      title="Share issue to WhatsApp / RWA group"
                      className="p-2 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-500 hover:text-emerald-700 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-xl">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      <span>{comp.upvotes}</span>
                    </div>

                    <span className="text-xs text-teal-700 font-semibold flex items-center gap-1 ml-1">
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
