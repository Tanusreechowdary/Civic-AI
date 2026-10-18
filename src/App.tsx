/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { CivicMap } from './components/CivicMap';
import { ReportIssueForm } from './components/ReportIssueForm';
import { TrackComplaint } from './components/TrackComplaint';
import { CitizenDashboard } from './components/CitizenDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CitizenLoginPage } from './components/CitizenLoginPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AuthModal } from './components/AuthModal';
import { Complaint, StatsSummary, User as UserType, IssueStatus, IssuePriority } from './types';
import { playSoftChime } from './utils/feedback';

export default function App() {
  // Authentication State: Null by default so options are only displayed AFTER login
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Active navigation tab: Starts at 'citizen-login' when not logged in
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'report' | 'track' | 'citizen' | 'admin' | 'citizen-login' | 'admin-login'>('citizen-login');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigation targets
  const [trackTargetId, setTrackTargetId] = useState<string | null>(null);
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Fetch initial complaints & stats
  const fetchAllData = async () => {
    try {
      const [compRes, statsRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/stats'),
      ]);

      if (compRes.ok) {
        const data = await compRes.json();
        setComplaints(data.complaints || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading civic data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Quick switch role between Citizen and Admin (for logged-in testing)
  const handleSwitchRole = () => {
    if (currentUser?.role === 'citizen') {
      setCurrentUser({
        id: 'adm-001',
        name: 'Commissioner Dr. K. Radhakrishnan',
        email: 'commissioner@civicmap.gov.in',
        phone: '9800011122',
        badgeId: 'KA-BBMP-ADM-01',
        role: 'admin',
        department: 'Central Municipal Administration & Urban Development, India',
        createdAt: '2025-11-01T08:00:00.000Z',
      });
      setActiveTab('admin');
      showToast('Switched to Municipal Administrator persona.');
    } else {
      setCurrentUser({
        id: 'cit-001',
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        phone: '9876543210',
        role: 'citizen',
        ward: 'Ward 150 - Bellandur, Bengaluru',
        createdAt: '2026-01-15T10:00:00.000Z',
      });
      setActiveTab('map');
      showToast('Switched to Citizen persona.');
    }
  };

  // Logout / Sign Out: Re-locks the portal and hides all options until next login
  const handleLogout = () => {
    playSoftChime('pop');
    setCurrentUser(null);
    setActiveTab('citizen-login');
    showToast('Signed out. Please log in to access Civic Map and services.');
  };

  // Reset Demo Data
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        showToast('Database reset to fresh civic demo state.');
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Upvote complaint
  const handleUpvoteComplaint = async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, upvotes: data.upvotes } : c))
        );
        showToast('Upvote recorded! Department alerted to community impact.');
      }
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  // Update Status / Priority / Department
  const handleUpdateComplaintStatus = async (
    id: string,
    updates: {
      status?: IssueStatus;
      priority?: IssuePriority;
      department?: string;
      assignedOfficer?: string;
      resolutionNotes?: string;
      resolvedImageUrl?: string;
    }
  ) => {
    try {
      const payload = {
        ...updates,
        actorName: currentUser?.name || 'Administrator',
        actorRole: currentUser?.role || 'admin',
      };

      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? data.complaint : c))
        );
        // Refresh stats
        fetch('/api/stats')
          .then((r) => r.json())
          .then((s) => setStats(s))
          .catch(() => {});
        showToast(`Complaint ${id} updated to ${updates.status || 'updated status'}.`);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Toggle duplicate status
  const handleToggleDuplicate = async (id: string, isDuplicate: boolean, duplicateOfId?: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDuplicate,
          duplicateOfId,
          actorName: currentUser?.name || 'Administrator',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? data.complaint : c))
        );
        showToast(isDuplicate ? `Merged ticket as duplicate.` : `Dismissed duplicate flag.`);
      }
    } catch (err) {
      console.error('Duplicate toggle failed:', err);
    }
  };

  // When a complaint is clicked on Map or Citizen dashboard
  const handleSelectComplaint = (complaint: Complaint) => {
    setTrackTargetId(complaint.id);
    setActiveTab('track');
  };

  // Navigate to report with map coordinates
  const handleNavigateToReportWithCoords = (coords?: { lat: number; lng: number }) => {
    if (coords) setReportCoords(coords);
    setActiveTab('report');
  };

  // After new complaint is submitted
  const handleNewComplaintSubmitted = (newComp: Complaint) => {
    setComplaints((prev) => [newComp, ...prev]);
    // Refresh stats
    fetch('/api/stats')
      .then((r) => r.json())
      .then((s) => setStats(s))
      .catch(() => {});
    showToast(`Complaint ${newComp.id} registered and prioritized!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbf9] text-stone-800 selection:bg-teal-500 selection:text-white">
      {/* Soft Light Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white/95 text-stone-800 text-xs font-semibold px-4 py-3 rounded-2xl shadow-lg border border-teal-200/90 animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar (options removed before login, displayed only after login) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
        isResetting={isResetting}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-500 font-semibold">
              Connecting to CivicMap India GIS Grid...
            </p>
          </div>
        ) : (
          <>
            {/* When NOT logged in: Gate the entire app so all options are accessible only after login */}
            {!currentUser ? (
              <div className="animate-in fade-in">
                {activeTab === 'admin-login' ? (
                  <AdminLoginPage
                    currentUser={null}
                    onLogin={(user) => {
                      setCurrentUser(user);
                      setActiveTab('admin');
                      showToast(`Welcome, ${user.name}! Municipal Administration Desk unlocked.`);
                    }}
                    onNavigate={setActiveTab}
                  />
                ) : (
                  <CitizenLoginPage
                    currentUser={null}
                    onLogin={(user) => {
                      setCurrentUser(user);
                      setActiveTab('map');
                      showToast(`Welcome back, ${user.name}! Civic Map & municipal services unlocked.`);
                    }}
                    onNavigate={setActiveTab}
                  />
                )}
              </div>
            ) : (
              /* When Logged in: Display all application options & components */
              <div className="animate-in fade-in">
                {activeTab === 'map' && (
                  <CivicMap
                    complaints={complaints}
                    onSelectComplaint={handleSelectComplaint}
                    onUpvoteComplaint={handleUpvoteComplaint}
                    onNavigateToReport={handleNavigateToReportWithCoords}
                  />
                )}

                {activeTab === 'report' && (
                  <ReportIssueForm
                    initialCoords={reportCoords}
                    onSuccess={handleNewComplaintSubmitted}
                    onCancel={() => setActiveTab('map')}
                    onNavigateToTrack={(id) => {
                      setTrackTargetId(id);
                      setActiveTab('track');
                    }}
                  />
                )}

                {activeTab === 'track' && (
                  <TrackComplaint
                    complaints={complaints}
                    initialComplaintId={trackTargetId}
                    currentUser={currentUser}
                    onUpdateStatus={(id, status, notes, photo) =>
                      handleUpdateComplaintStatus(id, {
                        status,
                        resolutionNotes: notes,
                        resolvedImageUrl: photo,
                      })
                    }
                  />
                )}

                {activeTab === 'citizen' && (
                  <CitizenDashboard
                    complaints={complaints}
                    currentUser={currentUser}
                    onNavigateToReport={() => setActiveTab('report')}
                    onSelectComplaint={handleSelectComplaint}
                    onNavigateToLogin={() => setActiveTab('citizen-login')}
                  />
                )}

                {activeTab === 'admin' && (
                  <AdminDashboard
                    complaints={complaints}
                    stats={stats}
                    onUpdateComplaint={handleUpdateComplaintStatus}
                    onToggleDuplicate={handleToggleDuplicate}
                    onSelectComplaintForInspect={handleSelectComplaint}
                    onNavigateToAdminLogin={() => setActiveTab('admin-login')}
                  />
                )}

                {activeTab === 'home' && (
                  <HomeHero stats={stats} onNavigate={setActiveTab} />
                )}

                {activeTab === 'citizen-login' && (
                  <CitizenLoginPage
                    currentUser={currentUser}
                    onLogin={(user) => {
                      setCurrentUser(user);
                      setActiveTab('map');
                      showToast(`Welcome, ${user.name}! Civic Map active.`);
                    }}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === 'admin-login' && (
                  <AdminLoginPage
                    currentUser={currentUser}
                    onLogin={(user) => {
                      setCurrentUser(user);
                      setActiveTab('admin');
                      showToast(`Welcome, ${user.name}! Operations Desk active.`);
                    }}
                    onNavigate={setActiveTab}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Light & Soft Friendly Footer */}
      <footer className="bg-white/90 text-stone-500 text-xs py-8 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              C
            </div>
            <span className="font-bold text-stone-800">CivicMap AI</span>
            <span>— Smart Civic Issue Mapping &amp; Resolution for India 🇮🇳</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-stone-500 text-[11px]">
            <span>Survey of India Grid</span>
            <span>•</span>
            <span>Gemini AI Auto-Triage</span>
            <span>•</span>
            <span>BBMP, MCD, BMC &amp; BWSSB Integration</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveTab('map');
          showToast(`Logged in as ${user.name} (${user.role}). All options unlocked.`);
        }}
      />
    </div>
  );
}
