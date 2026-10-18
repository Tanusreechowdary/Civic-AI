/**
 * Geographic utilities for CivicMap AI (Dedicated to India)
 */

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Strict geographical bounding box for Republic of India
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.5, 68.0], // South-West (Kanyakumari / Lakshadweep / Gujarat)
  [37.5, 97.5], // North-East (Kashmir / Ladakh / Arunachal Pradesh)
];

export const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
export const DEFAULT_INDIAN_CITY_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru

export function isWithinIndia(lat: number, lng: number): boolean {
  return lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;
}

// Indian cities reference coordinates for quick snap
export const INDIAN_METROS = [
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, zoom: 12, flag: '🌆' },
  { id: 'delhi', name: 'New Delhi (NCR)', state: 'Delhi', lat: 28.6139, lng: 77.2090, zoom: 12, flag: '🏛️' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, zoom: 12, flag: '🌊' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, zoom: 12, flag: '💎' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, zoom: 12, flag: '🏖️' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, zoom: 12, flag: '🌉' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, zoom: 12, flag: '⛰️' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, zoom: 12, flag: '🪁' },
];

// Approximate reverse geocoding for Indian coordinates
export function getEstimatedAddress(lat: number, lng: number): string {
  // Bengaluru region
  if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) {
    if (lat > 12.98 && lng > 77.62) {
      return `Near ITPL Main Road, Whitefield, Bengaluru - 560066, Karnataka, India`;
    } else if (lat < 12.93 && lng > 77.61) {
      return `Outer Ring Road, Bellandur, Ward 150, Bengaluru - 560103, Karnataka, India`;
    } else if (lat > 12.96 && lng < 77.60) {
      return `MG Road, Shivaji Nagar, Ward 110, Bengaluru - 560001, Karnataka, India`;
    }
    return `80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034, Karnataka, India`;
  }

  // Delhi NCR region
  if (lat >= 28.4 && lat <= 28.9 && lng >= 76.9 && lng <= 77.4) {
    if (lat > 28.62) {
      return `Radial Road 3, Connaught Place, New Delhi - 110001, Delhi, India`;
    }
    return `Ring Road, Lajpat Nagar Central Market, South Delhi - 110024, Delhi, India`;
  }

  // Mumbai region
  if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1) {
    if (lat > 19.1) {
      return `New Link Road, Andheri West, Ward K/W, Mumbai - 400053, Maharashtra, India`;
    }
    return `Turner Road, Bandra West, Ward H/W, Mumbai - 400050, Maharashtra, India`;
  }

  // Hyderabad region
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.3 && lng <= 78.6) {
    return `Road No. 36, Jubilee Hills / Hitec City, Hyderabad - 500033, Telangana, India`;
  }

  // Chennai region
  if (lat >= 12.9 && lat <= 13.3 && lng >= 80.1 && lng <= 80.4) {
    return `Anna Salai / T. Nagar, Chennai - 600017, Tamil Nadu, India`;
  }

  // Kolkata region
  if (lat >= 22.4 && lat <= 22.7 && lng >= 88.2 && lng <= 88.5) {
    return `Park Street / Salt Lake Sector V, Kolkata - 700091, West Bengal, India`;
  }

  // Pune region
  if (lat >= 18.4 && lat <= 18.7 && lng >= 73.7 && lng <= 74.0) {
    return `FC Road / Hinjawadi Phase 1, Pune - 411057, Maharashtra, India`;
  }

  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E, Municipal Ward Jurisdiction, India`;
}
