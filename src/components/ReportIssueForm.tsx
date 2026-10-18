import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Camera,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Compass,
  FileText,
  ShieldAlert,
  Loader2,
  X,
  ExternalLink,
  Info,
  Share2,
  Heart,
  Check,
} from 'lucide-react';
import { Complaint, IssueCategory } from '../types';
import { getEstimatedAddress, INDIAN_METROS, INDIA_BOUNDS } from '../utils/geo';
import { playSoftChime } from '../utils/feedback';

interface ReportIssueFormProps {
  initialCoords?: { lat: number; lng: number } | null;
  onSuccess: (newComplaint: Complaint) => void;
  onCancel: () => void;
  onNavigateToTrack: (id: string) => void;
}

// Preset realistic sample civic scenarios across India
const SAMPLE_PRESETS = [
  {
    name: '🕳️ Pothole (Bengaluru)',
    title: 'Hazardous Crater Pothole on Outer Ring Road Bellandur',
    description: 'Deep road cavity around 10 inches deep near EcoSpace tech park. Autos and two-wheelers are swerving into oncoming traffic to avoid shock damage.',
    category: 'pothole' as IssueCategory,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    lat: 12.9352,
    lng: 77.6772,
    address: 'Outer Ring Road, Bellandur, Ward 150, Bengaluru - 560103, Karnataka, India'
  },
  {
    name: '🗑️ Garbage (Delhi)',
    title: 'Overflowing Municipal Dumper at Lajpat Nagar Central Market',
    description: 'Community garbage bins have not been cleared for 4 days. Waste is spilling across the pedestrian sidewalk with strong rotting odors attracting stray animals.',
    category: 'garbage' as IssueCategory,
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    lat: 28.5700,
    lng: 77.2400,
    address: 'Central Market, Lajpat Nagar II, South Delhi - 110024, Delhi, India'
  },
  {
    name: '💡 Streetlight (Mumbai)',
    title: 'Damaged High-Mast Streetlight Pole on Linking Road',
    description: 'Streetlight pole casing damaged and light fixture flickering continuously. Entire pedestrian crossing in total darkness after 7 PM.',
    category: 'streetlight' as IssueCategory,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
    lat: 19.0596,
    lng: 72.8295,
    address: 'Linking Road, Bandra West, Ward H/W, Mumbai - 400050, Maharashtra, India'
  },
  {
    name: '🚰 Water Leak (Bengaluru)',
    title: 'BWSSB Underground Pipeline Rupture Flooding Road Surface',
    description: 'High pressure drinking water leaking onto roadway. Clean water pooling 4 inches deep and creating structural undermining beneath the asphalt curb.',
    category: 'water_supply' as IssueCategory,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    lat: 12.9719,
    lng: 77.6412,
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038, Karnataka, India'
  },
  {
    name: '🌊 Choked Drain (Hyderabad)',
    title: 'Main Stormwater Inlet Choked with Plastic Silt near Hitec City',
    description: 'Storm drain grates are clogged with plastic debris and packaging waste. Monsoon showers will cause rapid flash pooling on the IT corridor junction.',
    category: 'drainage' as IssueCategory,
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00be?auto=format&fit=crop&w=800&q=80',
    lat: 17.4435,
    lng: 78.3772,
    address: 'Hitec City Main Road, Cyberabad, Hyderabad - 500081, Telangana, India'
  }
];

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({
  initialCoords,
  onSuccess,
  onCancel,
  onNavigateToTrack,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [lat, setLat] = useState<number>(initialCoords?.lat || 12.9716);
  const [lng, setLng] = useState<number>(initialCoords?.lng || 77.5946);
  const [address, setAddress] = useState(
    getEstimatedAddress(initialCoords?.lat || 12.9716, initialCoords?.lng || 77.5946)
  );
  const [landmark, setLandmark] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);

  // AI Pre-Analysis state
  const [isScanningAI, setIsScanningAI] = useState(false);
  const [aiPreview, setAiPreview] = useState<any | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Map reference for interactive pin
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize mini picker map strictly bounded to India
  useEffect(() => {
    if (!miniMapContainerRef.current || miniMapInstanceRef.current) return;

    const map = L.map(miniMapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      minZoom: 4,
      maxZoom: 18,
      maxBounds: [
        [6.5, 68.0],
        [37.5, 97.5],
      ],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | India Survey Grid',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-civic-marker',
      html: `
        <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
          <div style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #0d9488;
            border: 2.5px solid white;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">
            📍
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setLat(pos.lat);
      setLng(pos.lng);
      setAddress(getEstimatedAddress(pos.lat, pos.lng));
      playSoftChime('pop');
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      setAddress(getEstimatedAddress(e.latlng.lat, e.latlng.lng));
      playSoftChime('pop');
    });

    miniMapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, []);

  // Update marker position when lat/lng change
  const updateMapPosition = (newLat: number, newLng: number, newAddress?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (newAddress) setAddress(newAddress);
    else setAddress(getEstimatedAddress(newLat, newLng));

    if (miniMapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      miniMapInstanceRef.current.panTo([newLat, newLng]);
    }
  };

  // Get current device location
  const handleUseDeviceLocation = () => {
    playSoftChime('click');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Verify inside India
        if (latitude >= 6.5 && latitude <= 37.5 && longitude >= 68.0 && longitude <= 97.5) {
          updateMapPosition(latitude, longitude);
        } else {
          updateMapPosition(12.9716, 77.5946, 'MG Road, Bengaluru - 560001, Karnataka, India');
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        updateMapPosition(12.9716, 77.5946, 'MG Road, Bengaluru - 560001, Karnataka, India');
      },
      { timeout: 8000 }
    );
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    setErrorMsg('');
    playSoftChime('pop');
    const reader = new FileReader();
    reader.onload = () => {
      setImageFilePreview(reader.result as string);
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Pre-Scan
  const handleRunAIScan = async () => {
    if (!title && !description) {
      setErrorMsg('Please enter a brief title or description before scanning with AI.');
      return;
    }

    setIsScanningAI(true);
    setErrorMsg('');
    playSoftChime('click');

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          latitude: lat,
          longitude: lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiPreview(data);
        if (data.categorySuggestion) {
          setCategory(data.categorySuggestion as IssueCategory);
        }
        playSoftChime('success');
      }
    } catch (err) {
      console.error('AI scan error:', err);
    } finally {
      setIsScanningAI(false);
    }
  };

  // 1-Click Fill Preset
  const handleLoadPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    playSoftChime('pop');
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    setImageFilePreview(preset.imageUrl);
    updateMapPosition(preset.lat, preset.lng, preset.address);
    setLandmark('Near Main Road Crossing');
    setAiPreview(null);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please provide a complaint title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a detailed description.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please specify the issue address or click on the map.');
      return;
    }

    setIsSubmitting(true);
    playSoftChime('click');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: lat,
        longitude: lng,
        address: address.trim(),
        landmark: landmark.trim(),
        imageUrl: imageUrl.trim() || undefined,
        userId: 'cit-001',
        userName: 'Priya Sharma',
        userEmail: 'priya.sharma@gmail.com',
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedComplaint(data.complaint);
        onSuccess(data.complaint);
        playSoftChime('success');

        // Confetti celebration
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#10b981', '#f59e0b', '#38bdf8'],
        });
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to submit complaint. Please check inputs.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg('Network error while connecting to municipal server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Share complaint to WhatsApp
  const handleShareToWhatsApp = (comp: Complaint) => {
    playSoftChime('click');
    const text = encodeURIComponent(
      `🚨 Support my civic report on CivicMap AI:\n` +
      `Ticket: [${comp.id}] ${comp.title}\n` +
      `Location: ${comp.address}\n` +
      `Department: ${comp.department}\n` +
      `Let's help our neighborhood get this resolved quickly!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {submittedComplaint ? (
        /* Soft, Human-Friendly Success State */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Complaint Registered Successfully 🇮🇳
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">
              Thank you for caring for your neighborhood!
            </h2>
            <p className="text-sm text-stone-600 max-w-lg mx-auto mt-1">
              Your civic report has been classified and prioritized by our AI system, and routed to the responsible municipal department.
            </p>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200/70 text-left max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-semibold">TICKET ID</span>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {submittedComplaint.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-semibold">DEPARTMENT</span>
              <span className="text-xs font-semibold text-stone-800">
                {submittedComplaint.department}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-semibold">INITIAL PRIORITY</span>
              <span className="text-xs font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {submittedComplaint.priority}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400 font-semibold">LOCATION</span>
              <span className="text-xs font-medium text-stone-600 truncate max-w-[260px]">
                {submittedComplaint.address}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToTrack(submittedComplaint.id)}
              className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span>Track Resolution Progress</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleShareToWhatsApp(submittedComplaint)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share to WhatsApp / RWA</span>
            </button>

            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors"
            >
              Back to Civic Map
            </button>
          </div>
        </div>
      ) : (
        /* Soft, Light, Friendly Report Form */
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 overflow-hidden">
          {/* Light Soft Header */}
          <div className="bg-gradient-to-r from-teal-50 via-emerald-50/40 to-stone-50 text-stone-800 p-6 sm:p-8 border-b border-stone-200/70">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-semibold border border-teal-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Citizen Reporting Portal 🇮🇳</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
                  Report a Civic Problem
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Pinpoint road hazards, sanitation backlogs, water leaks, or broken lighting. Our AI
                  analyzes urgency and notifies municipal teams.
                </p>
              </div>
              <button
                onClick={onCancel}
                className="hidden sm:block text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1-Click Human-Friendly Presets */}
            <div className="mt-5 pt-4 border-t border-stone-200/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                ⚡ Quick Fill Presets:
              </span>
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleLoadPreset(p)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-teal-50 text-stone-700 hover:text-teal-800 text-xs font-medium border border-stone-200 transition-all shadow-2xs"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Grid */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Select Issue Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'pothole', label: 'Pothole', icon: '🕳️' },
                  { id: 'garbage', label: 'Overflowing Garbage', icon: '🗑️' },
                  { id: 'streetlight', label: 'Damaged Streetlight', icon: '💡' },
                  { id: 'drainage', label: 'Drainage Blockage', icon: '🌊' },
                  { id: 'water_supply', label: 'Water Supply Issue', icon: '🚰' },
                  { id: 'road_damage', label: 'Road / Footpath Damage', icon: '⚠️' },
                  { id: 'other', label: 'Other Civic Problem', icon: '📌' },
                ].map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        playSoftChime('pop');
                        setCategory(cat.id as IssueCategory);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-2xs ring-1 ring-teal-500/30'
                          : 'border-stone-200/80 bg-stone-50/60 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Description Inputs */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deep crater pothole near metro station"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200/90 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-stone-50/30"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Detailed Description *
                  </label>
                  <button
                    type="button"
                    onClick={handleRunAIScan}
                    disabled={isScanningAI}
                    className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isScanningAI ? 'animate-spin' : ''}`} />
                    <span>{isScanningAI ? 'AI Scanning...' : 'AI Auto-Detect'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe the issue, hazards posed (two-wheelers, pedestrians, water contamination), and any nearby landmarks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200/90 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-stone-50/30"
                  required
                />
              </div>
            </div>

            {/* AI Pre-Scan Live Assistant */}
            {aiPreview && (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-xs text-teal-900">
                      AI Assistant Analysis
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                    Confidence: {Math.round((aiPreview.confidence || 0.9) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-teal-900/80 leading-relaxed">
                  {aiPreview.rationale}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-stone-500">Suggested Dept:</span>
                  <span className="font-semibold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {aiPreview.recommendedDepartment}
                  </span>
                  <span className="text-stone-500">• Suggested Priority:</span>
                  <span className="font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {aiPreview.prioritySuggestion}
                  </span>
                </div>
              </div>
            )}

            {/* Interactive India Map & Location Picker */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Select Location on India Map *
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Tap anywhere inside India or drag the pin to set the exact spot.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUseDeviceLocation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>Use My Location</span>
                </button>
              </div>

              {/* Quick City Jump Bar on Map */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-stone-400 uppercase shrink-0">
                  Quick City:
                </span>
                {INDIAN_METROS.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      playSoftChime('pop');
                      updateMapPosition(city.lat, city.lng);
                    }}
                    className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-teal-50 text-stone-700 hover:text-teal-800 border border-stone-200/80 transition-colors"
                  >
                    <span>{city.flag}</span> {city.name}
                  </button>
                ))}
              </div>

              {/* Map Canvas */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs h-60 bg-stone-100">
                <div ref={miniMapContainerRef} className="w-full h-full" />
              </div>

              {/* Coordinates & Address display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Street Address / Ward *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200/90 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Metro Pillar 142 or Central Market Gate"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200/90 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span>Latitude: <strong className="text-stone-600">{lat.toFixed(5)}</strong></span>
                <span>•</span>
                <span>Longitude: <strong className="text-stone-600">{lng.toFixed(5)}</strong></span>
                <span>•</span>
                <span className="text-teal-700 font-semibold">Strictly India Bounds Enforced 🇮🇳</span>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Photo Evidence (Max 5MB)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-stone-200 hover:border-teal-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-teal-50/30">
                  <Camera className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-xs font-semibold text-stone-700">
                    Upload Photo from Device
                  </span>
                  <span className="text-[10px] text-stone-400">
                    JPEG, PNG or WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-col justify-center space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-500">
                    Or paste Image URL:
                  </span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFilePreview(e.target.value);
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200/90 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Photo Preview */}
              {imageFilePreview && (
                <div className="relative rounded-2xl overflow-hidden aspect-video max-w-xs mt-2 border border-stone-200">
                  <img
                    src={imageFilePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFilePreview(null);
                      setImageUrl('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-stone-900/60 rounded-full text-white hover:bg-stone-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit & Cancel Actions */}
            <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting &amp; AI Routing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>Submit Civic Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
