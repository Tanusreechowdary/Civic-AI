import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Building2,
  Shield,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Flame,
  FileCheck,
  Copy,
  Sliders,
  Send,
  Eye,
  Check,
  X,
  Compass,
} from 'lucide-react';
import { Complaint, IssueCategory, IssuePriority, IssueStatus, StatsSummary } from '../types';
import { playSoftChime } from '../utils/feedback';

interface AdminDashboardProps {
  complaints: Complaint[];
  stats: StatsSummary | null;
  onUpdateComplaint: (
    id: string,
    updates: {
      status?: IssueStatus;
      priority?: IssuePriority;
      department?: string;
      assignedOfficer?: string;
      resolutionNotes?: string;
      resolvedImageUrl?: string;
    }
  ) => void;
  onToggleDuplicate: (id: string, isDuplicate: boolean, duplicateOfId?: string) => void;
  onSelectComplaintForInspect: (complaint: Complaint) => void;
  onNavigateToAdminLogin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  stats,
  onUpdateComplaint,
  onToggleDuplicate,
  onSelectComplaintForInspect,
  onNavigateToAdminLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'duplicates' | 'hotspots'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Edit Modal State
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<IssueStatus>('in_progress');
  const [editPriority, setEditPriority] = useState<IssuePriority>('medium');
  const [editDepartment, setEditDepartment] = useState('');
  const [editOfficer, setEditOfficer] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editResolvedImage, setEditResolvedImage] = useState('');

  const openEditModal = (comp: Complaint) => {
    playSoftChime('pop');
    setEditingComplaint(comp);
    setEditStatus(comp.status);
    setEditPriority(comp.priority);
    setEditDepartment(comp.department);
    setEditOfficer(comp.assignedOfficer || '');
    setEditNotes(comp.resolutionNotes || '');
    setEditResolvedImage(comp.resolvedImageUrl || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    playSoftChime('success');

    onUpdateComplaint(editingComplaint.id, {
      status: editStatus,
      priority: editPriority,
      department: editDepartment,
      assignedOfficer: editOfficer,
      resolutionNotes: editNotes,
      resolvedImageUrl: editStatus === 'resolved' ? (editResolvedImage || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80') : undefined,
    });

    setEditingComplaint(null);
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
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

  const duplicatePairs = complaints.filter((c) => c.isDuplicate);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Light & Soft Admin Header */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 rounded-3xl p-6 sm:p-8 text-stone-800 border border-stone-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Municipal Operations Center 🇮🇳</span>
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>India City GIS Online</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            Administrator Command Desk
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Triage citizen submissions, dispatch BBMP, MCD, BMC &amp; BWSSB engineering crews, review AI-flagged duplicates, and monitor resolution SLAs.
          </p>
        </div>

        {/* Soft Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
            { id: 'complaints', label: `Complaints (${complaints.length})`, icon: Layers },
            { id: 'duplicates', label: `Duplicates (${duplicatePairs.length})`, icon: Copy },
            { id: 'hotspots', label: 'Hotspot Analysis', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSoftChime('click');
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-teal-800 shadow-2xs border border-stone-200/80 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          {onNavigateToAdminLogin && (
            <button
              onClick={() => {
                playSoftChime('click');
                onNavigateToAdminLogin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 shadow-2xs transition-all"
              title="Open Admin Login to switch municipal officer credentials"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Officer Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Row with Light Soft Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs soft-card">
          <span className="text-xs font-semibold text-stone-500">Total Registered</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            {stats?.total ?? complaints.length}
          </div>
          <span className="text-[11px] text-teal-700 font-medium">All municipal wards</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200/70 shadow-2xs soft-card">
          <span className="text-xs font-semibold text-amber-800">Pending Review</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            {stats?.submitted ?? complaints.filter((c) => c.status === 'submitted').length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Requires initial triage</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-sky-200/70 shadow-2xs soft-card">
          <span className="text-xs font-semibold text-sky-800">Field In-Progress</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 mt-1">
            {stats?.inProgress ?? complaints.filter((c) => c.status === 'in_progress').length}
          </div>
          <span className="text-[11px] text-sky-700 font-medium">Dispatched field gangs</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/70 shadow-2xs soft-card">
          <span className="text-xs font-semibold text-emerald-800">Resolved &amp; Verified</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.resolved ?? complaints.filter((c) => c.status === 'resolved').length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {stats?.resolutionRatePercent ?? 75}% completion rate
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200/70 shadow-2xs col-span-2 lg:col-span-1 soft-card">
          <span className="text-xs font-semibold text-rose-800">Critical Hazards</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {stats?.criticalCount ?? complaints.filter((c) => c.priority === 'critical').length}
          </div>
          <span className="text-[11px] text-rose-700 font-bold">Priority SLA &lt;24hrs</span>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>Complaints by Category</span>
                </h3>
                <span className="text-xs text-stone-400 font-medium">Live Grid Distribution</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'pothole', label: 'Potholes & Road Cavities', color: 'bg-orange-500' },
                  { key: 'garbage', label: 'Solid Waste & Garbage Dumps', color: 'bg-emerald-600' },
                  { key: 'water_supply', label: 'Drinking Water Pipeline Bursts', color: 'bg-blue-600' },
                  { key: 'streetlight', label: 'Streetlight Luminaires & Cables', color: 'bg-amber-500' },
                  { key: 'drainage', label: 'Storm Drains & Rajakaluve Floods', color: 'bg-sky-600' },
                  { key: 'road_damage', label: 'Footpath & Paver Slab Hazards', color: 'bg-rose-500' },
                ].map((item) => {
                  const count = complaints.filter((c) => c.category === item.key).length;
                  const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-stone-700">{item.label}</span>
                        <span className="text-stone-900 font-bold">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Performance & SLA */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Municipal Department Performance</span>
                </h3>
                <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Avg SLA: 2.4 Days
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'BBMP Road Infrastructure & Public Works', lead: 'Exec. Eng. K. Ramesh' },
                  { name: 'Solid Waste Management & Swachh Bharat Cell', lead: 'Inspector R. P. Meena' },
                  { name: 'Bangalore Water Supply and Sewerage Board (BWSSB)', lead: 'Chief Eng. S. Sundararajan' },
                  { name: 'BESCOM / BSES Urban Electrical & Lighting Board', lead: 'Asst. Eng. Manoj Patil' },
                  { name: 'Stormwater Drains (SWD) & Flood Control Authority', lead: 'Supt. Eng. Govind Raj' },
                ].map((dept) => {
                  const deptComplaints = complaints.filter((c) => c.department === dept.name);
                  const resolved = deptComplaints.filter((c) => c.status === 'resolved').length;
                  const rate = deptComplaints.length > 0 ? Math.round((resolved / deptComplaints.length) * 100) : 100;
                  return (
                    <div
                      key={dept.name}
                      className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/70 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-800">{dept.name}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">Officer: {dept.lead}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-stone-900">
                          {resolved}/{deptComplaints.length} Done
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rate >= 70 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {rate}% Complete
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER COMPLAINTS TABLE TAB */}
      {(activeTab === 'complaints' || activeTab === 'overview') && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-6 border-b border-stone-200/70 bg-stone-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                Master Civic Complaints Registry
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Showing {filtered.length} of {complaints.length} municipal records across India
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title, ID, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200/80 text-xs bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-white text-stone-700"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="water_supply">Water Supply</option>
                <option value="streetlight">Streetlight</option>
                <option value="drainage">Drainage</option>
                <option value="road_damage">Road Damage</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-white text-stone-700"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200/70">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title &amp; Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filtered.map((comp) => {
                  const isResolved = comp.status === 'resolved';
                  return (
                    <tr key={comp.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">
                        {comp.id}
                        {comp.isDuplicate && (
                          <span className="block text-[9px] text-amber-700 font-sans font-bold">
                            ⚠️ Duplicate
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-stone-900 truncate">{comp.title}</div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">
                          📍 {comp.address}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize font-medium">{comp.category.replace('_', ' ')}</td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            comp.priority === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : comp.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {comp.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : comp.status === 'in_progress'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isResolved ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{comp.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 truncate max-w-[140px]">
                        {comp.department}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            playSoftChime('click');
                            onSelectComplaintForInspect(comp);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => openEditModal(comp)}
                          className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] shadow-2xs transition-colors"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DUPLICATE COMPLAINTS REVIEW TAB */}
      {activeTab === 'duplicates' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-600" />
                <span>AI-Detected Duplicate Complaints Review</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Complaints reported within 300 meters with matching issue descriptions and semantic tokens.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {duplicatePairs.length} Potential Duplicate(s) Flagged
            </span>
          </div>

          {duplicatePairs.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-stone-800">No Pending Duplicate Conflicts</h4>
              <p className="text-xs text-stone-500 mt-1">All active tickets represent distinct civic incidents.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicatePairs.map((comp) => {
                const parent = complaints.find((c) => c.id === comp.duplicateOfId);
                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-3xl border border-amber-200 bg-amber-50/30 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900">
                          Flagged Ticket: <span className="font-mono">{comp.id}</span>
                        </span>
                        <span>➔ Linked to Parent Ticket:</span>
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {comp.duplicateOfId || 'Active Nearby'}
                        </span>
                      </div>
                      <span className="text-amber-800 font-semibold bg-amber-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        AI Similarity Score: ~92%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Flagged Item */}
                      <div className="p-3.5 bg-white rounded-2xl border border-amber-200">
                        <div className="font-bold text-stone-900 mb-1">{comp.title}</div>
                        <p className="text-stone-600 text-[11px]">{comp.description}</p>
                        <div className="mt-2 text-[10px] text-stone-400">
                          📍 {comp.address} • Reported by {comp.userName}
                        </div>
                      </div>

                      {/* Parent Item */}
                      <div className="p-3.5 bg-white rounded-2xl border border-stone-200">
                        <div className="font-bold text-stone-900 mb-1">
                          {parent ? parent.title : 'Primary Active Complaint'}
                        </div>
                        <p className="text-stone-600 text-[11px]">
                          {parent ? parent.description : 'Primary ticket registered earlier with ongoing dispatch.'}
                        </p>
                        <div className="mt-2 text-[10px] text-stone-400">
                          📍 {parent ? parent.address : comp.address} • Status: {parent?.status || 'Active'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          playSoftChime('pop');
                          onToggleDuplicate(comp.id, false);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors"
                      >
                        Dismiss Flag (Keep Separate)
                      </button>
                      <button
                        onClick={() => {
                          playSoftChime('success');
                          onToggleDuplicate(comp.id, true, comp.duplicateOfId);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        Confirm &amp; Merge Duplicate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HOTSPOTS TAB */}
      {activeTab === 'hotspots' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Geographic Risk &amp; Hotspot Clustering</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Autonomous spatial density analysis identifying infrastructure failure zones in major Indian cities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-orange-950">Outer Ring Road Bellandur (Bengaluru)</span>
                <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  High Pothole Risk
                </span>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed">
                Pothole and road asphalt breakdown cluster near EcoSpace &amp; Bellandur. Heavy commuter two-wheeler and BMTC bus density.
              </p>
              <div className="text-[11px] font-semibold text-orange-800 pt-1">
                Action: BBMP midnight milling and asphalt compaction operation.
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-950">Central Market Lajpat Nagar (South Delhi)</span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Sanitation Cluster
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Solid waste overflow and commercial dumper bins exceeding capacity during weekend market footfall.
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 pt-1">
                Action: Added dedicated MCD evening compactor vehicle route.
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-sky-950">Linking Road Bandra (Mumbai)</span>
                <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                  Pedestrian Safety Alert
                </span>
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                High-mast lighting maintenance and dark alley hazard near National College junction.
              </p>
              <div className="text-[11px] font-semibold text-sky-800 pt-1">
                Action: LED luminaire replacement and pole grounding completed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full border border-stone-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 border-b border-stone-200/70 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                  {editingComplaint.id}
                </span>
                <h3 className="font-extrabold text-base text-stone-900 mt-1">Update Municipal Status &amp; SLA</h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <div className="p-2.5 bg-stone-50 rounded-xl text-stone-700 font-medium border border-stone-200/60">
                  {editingComplaint.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Status Progression
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Assigned Municipal Department
                </label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800"
                >
                  <option value="BBMP Road Infrastructure & Public Works">BBMP Road Infrastructure &amp; Public Works</option>
                  <option value="Solid Waste Management & Swachh Bharat Cell">Solid Waste Management &amp; Swachh Bharat Cell</option>
                  <option value="Bangalore Water Supply and Sewerage Board (BWSSB)">Bangalore Water Supply and Sewerage Board (BWSSB)</option>
                  <option value="BESCOM / BSES Urban Electrical & Lighting Board">BESCOM / BSES Urban Electrical &amp; Lighting Board</option>
                  <option value="Stormwater Drains (SWD) & Flood Control Authority">Stormwater Drains (SWD) &amp; Flood Control Authority</option>
                  <option value="General Municipal Citizen Services Bureau">General Municipal Citizen Services Bureau</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Assigned Field Engineer / Officer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exec. Eng. K. Ramesh (BBMP Mahadevapura)"
                  value={editOfficer}
                  onChange={(e) => setEditOfficer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Resolution Notes / Progress Update
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail work performed on site, machinery used, or quality certification logs..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                />
              </div>

              {editStatus === 'resolved' && (
                <div>
                  <label className="block font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Verified "After" Photo Proof URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... photo URL showing resolved condition"
                    value={editResolvedImage}
                    onChange={(e) => setEditResolvedImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-2xs"
                >
                  Save Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
