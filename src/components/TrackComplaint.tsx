import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Shield,
  FileCheck,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Send,
  Eye,
  Check,
  Share2,
  PhoneCall,
} from 'lucide-react';
import { Complaint, IssueStatus, User as UserType } from '../types';
import { playSoftChime } from '../utils/feedback';

interface TrackComplaintProps {
  complaints: Complaint[];
  initialComplaintId?: string | null;
  currentUser: UserType | null;
  onUpdateStatus: (id: string, newStatus: IssueStatus, notes: string, resolvedImage?: string) => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  complaints,
  initialComplaintId,
  currentUser,
  onUpdateStatus,
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId || '');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchError, setSearchError] = useState('');

  // Admin status update state
  const [newStatus, setNewStatus] = useState<IssueStatus>('in_progress');
  const [adminNotes, setAdminNotes] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [compareMode, setCompareMode] = useState<'side_by_side' | 'before' | 'after'>('side_by_side');

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      const match = complaints.find(
        (c) => c.id.toLowerCase() === initialComplaintId.toLowerCase()
      );
      if (match) {
        setSelectedComplaint(match);
        setSearchError('');
      }
    } else if (complaints.length > 0 && !selectedComplaint) {
      // Default to first active complaint
      setSelectedComplaint(complaints[0]);
      setSearchId(complaints[0].id);
    }
  }, [initialComplaintId, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    playSoftChime('click');

    const match = complaints.find(
      (c) =>
        c.id.toLowerCase() === searchId.trim().toLowerCase() ||
        c.id.toLowerCase().includes(searchId.trim().toLowerCase())
    );

    if (match) {
      setSelectedComplaint(match);
      setSearchError('');
      playSoftChime('pop');
    } else {
      setSearchError(`No complaint found with ID "${searchId}". Please check and retry.`);
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    playSoftChime('click');
    try {
      await onUpdateStatus(
        selectedComplaint.id,
        newStatus,
        adminNotes.trim() || 'Status update logged by municipal authorized officer.',
        newStatus === 'resolved' ? (afterPhotoUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80') : undefined
      );

      // Refresh selected complaint
      const updated = complaints.find((c) => c.id === selectedComplaint.id);
      if (updated) setSelectedComplaint(updated);
      setAdminNotes('');
      playSoftChime('success');
    } finally {
      setIsUpdating(false);
    }
  };

  // WhatsApp Share
  const handleShareToWhatsApp = () => {
    if (!selectedComplaint) return;
    playSoftChime('click');
    const text = encodeURIComponent(
      `🚨 Track this civic issue on CivicMap AI:\n` +
      `Ticket: [${selectedComplaint.id}] ${selectedComplaint.title}\n` +
      `Location: ${selectedComplaint.address}\n` +
      `Department: ${selectedComplaint.department}\n` +
      `Status: ${selectedComplaint.status.replace('_', ' ').toUpperCase()}\n` +
      `Stay informed on our neighborhood progress!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const statusSteps: { id: IssueStatus; label: string; desc: string }[] = [
    { id: 'submitted', label: '1. Submitted', desc: 'Logged with GPS & Citizen Photo' },
    { id: 'under_review', label: '2. Under Review', desc: 'AI Triage & Verification' },
    { id: 'assigned', label: '3. Assigned', desc: 'Dispatched to Department Authority' },
    { id: 'in_progress', label: '4. In Progress', desc: 'Field Engineers On Site' },
    { id: 'resolved', label: '5. Resolved', desc: 'Completed & Certified with After Photo' },
  ];

  const getStepStatus = (stepId: IssueStatus, currentStatus: IssueStatus) => {
    const order: IssueStatus[] = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Light & Soft Search Header */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 rounded-3xl p-6 sm:p-8 text-stone-800 border border-stone-200/80 shadow-sm">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-white px-3 py-1 rounded-full border border-teal-200 shadow-2xs">
            Real-Time Resolution Tracker 🇮🇳
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
            Track Civic Issue Status
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
            Search with your unique complaint ticket ID to view live departmental assignment, field dispatch, and official resolution proofs.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Complaint ID (e.g. CIV-2026-1041)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200/90 text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <span>Track Progress</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Tickets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 text-[11px] font-semibold">Quick inspect tickets:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                playSoftChime('pop');
                setSearchId(c.id);
                setSelectedComplaint(c);
                setSearchError('');
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 text-stone-700 hover:text-teal-800 border border-stone-200 text-xs transition-colors shadow-2xs"
            >
              {c.id}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Selected Complaint Tracking Details */}
      {selectedComplaint ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden">
            {/* Ticket Header */}
            <div className="p-6 sm:p-8 border-b border-stone-200/70 bg-stone-50/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {selectedComplaint.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedComplaint.priority === 'critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : selectedComplaint.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      Priority: {selectedComplaint.priority.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedComplaint.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {selectedComplaint.status === 'resolved' ? 'Resolved ✓' : selectedComplaint.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    {selectedComplaint.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{selectedComplaint.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareToWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <div className="text-right pl-2 sm:border-l sm:border-stone-200">
                    <span className="text-[10px] text-stone-400 font-semibold block">DATE LOGGED</span>
                    <span className="text-xs font-bold text-stone-700">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Stage Status Timeline */}
            <div className="p-6 sm:p-8 border-b border-stone-200/70 bg-white">
              <h3 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-6">
                Resolution Lifecycle Progression
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {statusSteps.map((step, idx) => {
                  const state = getStepStatus(step.id, selectedComplaint.status);
                  return (
                    <div key={step.id} className="relative flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            state === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : state === 'current'
                              ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {state === 'completed' ? '✓' : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            state === 'current'
                              ? 'text-teal-800 font-extrabold'
                              : state === 'completed'
                              ? 'text-stone-800'
                              : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Assignment & Details */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Complaint Specifics */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-2">
                    Issue Description
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                    <span className="text-stone-400 text-[11px] block">Assigned Department</span>
                    <span className="font-semibold text-stone-800 mt-1 block">
                      🏛️ {selectedComplaint.department}
                    </span>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                    <span className="text-stone-400 text-[11px] block">Field Officer In-Charge</span>
                    <span className="font-semibold text-stone-800 mt-1 block">
                      👤 {selectedComplaint.assignedOfficer || 'Mahadevapura Ward Engineering Gang #3'}
                    </span>
                  </div>
                </div>

                {/* AI Assistant Rationale */}
                {selectedComplaint.aiAnalysis && (
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-teal-800">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Smart Classification Rationale</span>
                    </div>
                    <p className="text-teal-900/80 leading-relaxed">
                      {selectedComplaint.aiAnalysis.rationale}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-teal-700 pt-1">
                      <span>Detected Hazards: {selectedComplaint.aiAnalysis.detectedKeywords.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Photos & Verification */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                    Visual Evidence &amp; Verification
                  </h4>
                  {selectedComplaint.status === 'resolved' && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Resolution Verified ✓
                    </span>
                  )}
                </div>

                {/* Comparison Selector if Resolved */}
                {selectedComplaint.status === 'resolved' && selectedComplaint.resolvedImageUrl && (
                  <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setCompareMode('side_by_side')}
                      className={`flex-1 py-1 rounded-lg transition-all ${compareMode === 'side_by_side' ? 'bg-white shadow-2xs text-teal-900 font-bold' : 'text-stone-600'}`}
                    >
                      Side by Side
                    </button>
                    <button
                      onClick={() => setCompareMode('before')}
                      className={`flex-1 py-1 rounded-lg transition-all ${compareMode === 'before' ? 'bg-white shadow-2xs text-teal-900 font-bold' : 'text-stone-600'}`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setCompareMode('after')}
                      className={`flex-1 py-1 rounded-lg transition-all ${compareMode === 'after' ? 'bg-white shadow-2xs text-teal-900 font-bold' : 'text-stone-600'}`}
                    >
                      After
                    </button>
                  </div>
                )}

                {/* Display Image Based on Comparison Mode */}
                {selectedComplaint.status === 'resolved' && selectedComplaint.resolvedImageUrl && compareMode === 'side_by_side' ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
                      <img
                        src={selectedComplaint.imageUrl}
                        alt="Initial damage"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        BEFORE (Reported Incident)
                      </span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-300 aspect-video bg-emerald-50">
                      <img
                        src={selectedComplaint.resolvedImageUrl}
                        alt="Verified resolution"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        AFTER (Verified Municipal Repair)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
                    <img
                      src={
                        compareMode === 'after' && selectedComplaint.resolvedImageUrl
                          ? selectedComplaint.resolvedImageUrl
                          : selectedComplaint.imageUrl
                      }
                      alt={selectedComplaint.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {compareMode === 'after' ? 'Resolved State' : 'Reported Incident Photo'}
                    </span>
                  </div>
                )}

                {selectedComplaint.status === 'resolved' && selectedComplaint.resolutionNotes && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900">
                    <strong>Official Municipal Resolution Log:</strong> {selectedComplaint.resolutionNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="p-6 sm:p-8 border-t border-stone-200/70 bg-stone-50/40">
              <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-4">
                Official Chronological Audit Trail
              </h4>
              <div className="space-y-3">
                {selectedComplaint.timeline.map((entry, idx) => (
                  <div key={entry.id || idx} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5 shrink-0 ring-4 ring-teal-100" />
                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex-1 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900">
                          {entry.actorName} ({entry.actorRole})
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Administrator Update Panel */}
            <div className="p-6 bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 text-stone-800 border-t border-stone-200/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-sm text-stone-900">
                    Authorized Status Progression &amp; Resolution
                  </h4>
                </div>
                <span className="text-[10px] text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                  Municipal Official Override
                </span>
              </div>

              <form onSubmit={handleAdminUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Advance Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned to Dept</option>
                    <option value="in_progress">In Progress (Field Unit)</option>
                    <option value="resolved">Resolved (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Progress / Resolution Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asphalt compaction completed; road reopened."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Saving...' : 'Post Status Update'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-2xs">
          <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No complaint selected</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Please enter a Complaint ID in the search box above or choose a ticket from the demo list.
          </p>
        </div>
      )}
    </div>
  );
};
