import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Filter,
  Layers,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ExternalLink,
  Flame,
  Info,
  Maximize2,
  Navigation,
  Share2,
  Heart,
  MapPin,
  Check,
  X,
  Compass,
} from 'lucide-react';
import { Complaint, IssueCategory, IssuePriority, IssueStatus } from '../types';
import { INDIAN_METROS, INDIA_BOUNDS } from '../utils/geo';
import { playSoftChime } from '../utils/feedback';

interface CivicMapProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onUpvoteComplaint: (id: string) => void;
  onNavigateToReport: (coords?: { lat: number; lng: number }) => void;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  complaints,
  onSelectComplaint,
  onUpvoteComplaint,
  onNavigateToReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all_india');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeComplaintModal, setActiveComplaintModal] = useState<Complaint | null>(null);
  const [justUpvotedId, setJustUpvotedId] = useState<string | null>(null);

  // Soft, warm color palette for categories
  const getCategoryTheme = (category: IssueCategory) => {
    switch (category) {
      case 'pothole':
        return { color: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', name: 'Pothole', icon: '🕳️' };
      case 'garbage':
        return { color: '#16a34a', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', name: 'Garbage', icon: '🗑️' };
      case 'streetlight':
        return { color: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', name: 'Streetlight', icon: '💡' };
      case 'drainage':
        return { color: '#0284c7', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', name: 'Drainage', icon: '🌊' };
      case 'water_supply':
        return { color: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', name: 'Water Supply', icon: '🚰' };
      case 'road_damage':
        return { color: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', name: 'Road Damage', icon: '⚠️' };
      default:
        return { color: '#64748b', bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', name: 'Other', icon: '📌' };
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate complaints count by city
  const getCityComplaintCount = (cityLat: number, cityLng: number) => {
    return complaints.filter((c) => {
      const dLat = Math.abs(c.latitude - cityLat);
      const dLng = Math.abs(c.longitude - cityLng);
      return dLat < 0.4 && dLng < 0.4;
    }).length;
  };

  // Initialize Map restricted strictly to India
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      maxBounds: [
        [6.5, 68.0],   // Southern & Western bound of India
        [37.5, 97.5],  // Northern & Eastern bound of India
      ],
      maxBoundsViscosity: 1.0, // Strictly prevents panning outside India
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Warm, soft OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Republic of India GIS Grid',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers with soft light styling
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredComplaints.forEach((comp) => {
      const theme = getCategoryTheme(comp.category);
      const isCritical = comp.priority === 'critical';
      const isResolved = comp.status === 'resolved';

      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; cursor: pointer; transition: transform 0.2s;">
          ${
            isCritical
              ? `<div style="position: absolute; top: -6px; left: -6px; width: 46px; height: 46px; border-radius: 50%; background: ${theme.color}25; animation: pulse-soft 2s infinite;"></div>`
              : ''
          }
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: ${isResolved ? '#10b981' : theme.color};
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: bold;
          ">
            ${isResolved ? '✓' : theme.icon}
          </div>
          <div style="
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 7px;
            height: 7px;
            background: ${isResolved ? '#10b981' : theme.color};
            z-index: -1;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-civic-marker',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([comp.latitude, comp.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; width: 240px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.05em;">${comp.id}</span>
            <span style="
              font-size: 10px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 9999px;
              background: ${comp.priority === 'critical' ? '#ffe4e6; color: #be123c' : comp.priority === 'high' ? '#ffedd5; color: #c2410c' : '#f1f5f9; color: #475569'};
            ">
              ${comp.priority.toUpperCase()}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; line-height: 1.3;">
            ${comp.title}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.35;">
            📍 ${comp.address}
          </p>
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid #f1f5f9;">
            <span style="font-size: 11px; font-weight: 600; color: ${isResolved ? '#059669' : '#0d9488'};">
              ${isResolved ? 'Resolved ✓' : comp.status.replace('_', ' ').toUpperCase()}
            </span>
            <button id="view-ticket-${comp.id}" style="
              background: #0d9488;
              color: white;
              border: none;
              padding: 4px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
            ">
              View Details →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-ticket-${comp.id}`);
        if (btn) {
          btn.onclick = () => {
            playSoftChime('pop');
            setActiveComplaintModal(comp);
            marker.closePopup();
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredComplaints]);

  // Update Hotspot Circles (Soft pastel overlays)
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;

    hotspotsLayerRef.current.clearLayers();

    if (!showHotspots) return;

    // Indian Hotspot density regions with gentle colors
    const clusters = [
      {
        center: [12.9352, 77.6772] as [number, number],
        radius: 650,
        color: '#f97316',
        label: 'Hotspot: Outer Ring Road Bellandur (High Pothole & Traffic Density)',
      },
      {
        center: [28.5700, 77.2400] as [number, number],
        radius: 600,
        color: '#10b981',
        label: 'Hotspot: Lajpat Nagar Central Market (Commercial Solid Waste Cluster)',
      },
      {
        center: [19.0596, 72.8295] as [number, number],
        radius: 550,
        color: '#f59e0b',
        label: 'Hotspot: Bandra West Linking Road (Lighting & Pedestrian Safety)',
      },
      {
        center: [12.9719, 77.6412] as [number, number],
        radius: 500,
        color: '#0ea5e9',
        label: 'Hotspot: Indiranagar 100 Feet Road (Water Pipeline Pressure Drop)',
      },
    ];

    clusters.forEach((c) => {
      const circle = L.circle(c.center, {
        color: c.color,
        fillColor: c.color,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
        radius: c.radius,
      });

      circle.bindTooltip(c.label, { permanent: false, direction: 'top' });
      circle.addTo(hotspotsLayerRef.current!);
    });
  }, [showHotspots]);

  // Fly to selected Indian city
  const handleSelectCity = (cityId: string) => {
    playSoftChime('click');
    setSelectedCityId(cityId);
    if (!mapInstanceRef.current) return;

    if (cityId === 'all_india') {
      mapInstanceRef.current.flyTo([20.5937, 78.9629], 5, { duration: 1.4 });
    } else {
      const metro = INDIAN_METROS.find((m) => m.id === cityId);
      if (metro) {
        mapInstanceRef.current.flyTo([metro.lat, metro.lng], metro.zoom, { duration: 1.2 });
      }
    }
  };

  // Location search pan
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    const matched = complaints.find(
      (c) =>
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matched) {
      playSoftChime('pop');
      mapInstanceRef.current.flyTo([matched.latitude, matched.longitude], 16, { duration: 1.2 });
      setActiveComplaintModal(matched);
    }
  };

  // Handle upvoting with instant feedback
  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSoftChime('pop');
    setJustUpvotedId(id);
    onUpvoteComplaint(id);
    setTimeout(() => setJustUpvotedId(null), 2000);
  };

  // Share complaint to WhatsApp
  const handleShareToWhatsApp = (comp: Complaint) => {
    playSoftChime('click');
    const text = encodeURIComponent(
      `🚨 Community Issue on CivicMap AI:\n` +
      `Ticket: [${comp.id}] ${comp.title}\n` +
      `Location: ${comp.address}\n` +
      `Status: ${comp.status.replace('_', ' ').toUpperCase()}\n` +
      `Department: ${comp.department}\n` +
      `Let's help our ward get this resolved!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'pothole', label: 'Pothole' },
    { id: 'garbage', label: 'Garbage' },
    { id: 'streetlight', label: 'Streetlight' },
    { id: 'drainage', label: 'Drainage' },
    { id: 'water_supply', label: 'Water' },
    { id: 'road_damage', label: 'Roads' },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-[#f8faf8] overflow-hidden">
      {/* City Quick-Jump Bar for India */}
      <div className="z-20 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto shadow-2xs scrollbar-none">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>India Cities:</span>
        </span>

        <button
          onClick={() => handleSelectCity('all_india')}
          className={`shrink-0 text-xs px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
            selectedCityId === 'all_india'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <span>🇮🇳</span>
          <span>All India</span>
          <span className="text-[10px] opacity-80">({complaints.length})</span>
        </button>

        {INDIAN_METROS.map((city) => {
          const count = getCityComplaintCount(city.lat, city.lng);
          const isSelected = selectedCityId === city.id;
          return (
            <button
              key={city.id}
              onClick={() => handleSelectCity(city.id)}
              className={`shrink-0 text-xs px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white hover:bg-teal-50/60 text-stone-700 border border-stone-200/80'
              }`}
            >
              <span>{city.flag}</span>
              <span>{city.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-teal-700 text-teal-100' : 'bg-teal-50 text-teal-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top Floating Map Controls */}
      <div className="absolute top-14 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200/80 px-3.5 py-2 flex items-center gap-2 w-full max-w-sm"
        >
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Search address, complaint ID (e.g. CIV-2026-1041)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-stone-400 hover:text-stone-600 px-1"
            >
              ✕
            </button>
          )}
        </form>

        {/* Filters Toolbar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200/80 p-1.5 flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200/80 text-stone-700 rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200/80 text-stone-700 rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200/80 text-stone-700 rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">🚨 Critical</option>
            <option value="high">⚠️ High</option>
            <option value="medium">⚡ Medium</option>
            <option value="low">🌱 Low</option>
          </select>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showHotspots
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-stone-50 text-stone-600 border border-stone-200/80'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHotspots ? 'text-amber-600' : 'text-stone-400'}`} />
            <span>Hotspots</span>
          </button>
        </div>
      </div>

      {/* Floating Action Button: Report Issue At Center */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            playSoftChime('click');
            if (mapInstanceRef.current) {
              const center = mapInstanceRef.current.getCenter();
              onNavigateToReport({ lat: center.lat, lng: center.lng });
            } else {
              onNavigateToReport();
            }
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-teal-700/20 flex items-center gap-2 border border-teal-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Navigation className="w-4 h-4" />
          <span>Report Issue Here</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 right-16 z-20 hidden md:block bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-sm border border-stone-200/80 text-[11px] text-stone-600">
        <div className="font-bold text-stone-800 mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Civic Issue Types</span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
            {filteredComplaints.length} shown
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Pothole (Roads)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Garbage (Sanitation)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Streetlight (Lighting)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Drainage (Stormwater)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Water Supply (BWSSB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Damage / Hazard</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Inspect Modal with Light, Soft, Friendly Design */}
      {activeComplaintModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                    {activeComplaintModal.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeComplaintModal.priority === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : activeComplaintModal.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Priority: {activeComplaintModal.priority.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeComplaintModal.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {activeComplaintModal.status === 'resolved' ? 'Resolved ✓' : activeComplaintModal.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                  {activeComplaintModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveComplaintModal(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview */}
            {activeComplaintModal.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-200/80">
                <img
                  src={activeComplaintModal.imageUrl}
                  alt={activeComplaintModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-stone-900/60 backdrop-blur-xs text-[10px] text-white font-medium">
                  Citizen Photo Evidence
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
              {activeComplaintModal.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-stone-400 block text-[11px]">Location</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  📍 {activeComplaintModal.address}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                <span className="text-stone-400 block text-[11px]">Assigned Department</span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  🏛️ {activeComplaintModal.department}
                </span>
              </div>
            </div>

            {/* AI Assistant Explanation Box */}
            {activeComplaintModal.aiAnalysis && (
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>AI Smart Analysis</span>
                </div>
                <p className="text-xs text-teal-900/80 leading-relaxed">
                  {activeComplaintModal.aiAnalysis.rationale}
                </p>
              </div>
            )}

            {/* Interactive Actions: Upvote, WhatsApp Share, Track */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleUpvote(activeComplaintModal.id, e)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    justUpvotedId === activeComplaintModal.id
                      ? 'bg-rose-500 text-white scale-105'
                      : 'bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 border border-stone-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${justUpvotedId === activeComplaintModal.id ? 'fill-white' : ''}`} />
                  <span>{activeComplaintModal.upvotes} Upvotes</span>
                </button>

                <button
                  onClick={() => handleShareToWhatsApp(activeComplaintModal)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <button
                onClick={() => {
                  playSoftChime('click');
                  onSelectComplaint(activeComplaintModal);
                  setActiveComplaintModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Track Full History</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
