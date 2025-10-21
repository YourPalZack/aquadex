/**
 * Mapbox Utility Functions
 * 
 * Provides geocoding and map-related utilities for the local store directory feature.
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const GEOCODING_API_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Geocoding result from Mapbox API
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  place_name: string;
  context?: {
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 * 
 * @param address - Full address string (e.g., "123 Main St, Boston, MA 02101")
 * @returns Geocoding result with coordinates and formatted address
 * @throws Error if geocoding fails or API key is missing
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not configured');
  }

  if (!address || address.trim().length === 0) {
    throw new Error('Address is required');
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${GEOCODING_API_BASE}/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('Address not found - please check the address and try again');
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    // Extract context information
    const context: GeocodeResult['context'] = {};
    if (feature.context) {
      for (const item of feature.context) {
        if (item.id.startsWith('place.')) {
          context.city = item.text;
        } else if (item.id.startsWith('region.')) {
          context.state = item.short_code?.replace('US-', '');
        } else if (item.id.startsWith('postcode.')) {
          context.postal_code = item.text;
        } else if (item.id.startsWith('country.')) {
          context.country = item.short_code;
        }
      }
    }

    return {
      latitude,
      longitude,
      formatted_address: feature.place_name,
      place_name: feature.place_name,
      context,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to geocode address');
  }
}

/**
 * Reverse geocode coordinates to an address
 * 
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate
 * @returns Geocoding result with address information
 * @throws Error if reverse geocoding fails or API key is missing
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number
): Promise<GeocodeResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not configured');
  }

  try {
    const url = `${GEOCODING_API_BASE}/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('Location not found');
    }

    const feature = data.features[0];

    // Extract context information
    const context: GeocodeResult['context'] = {};
    if (feature.context) {
      for (const item of feature.context) {
        if (item.id.startsWith('place.')) {
          context.city = item.text;
        } else if (item.id.startsWith('region.')) {
          context.state = item.short_code?.replace('US-', '');
        } else if (item.id.startsWith('postcode.')) {
          context.postal_code = item.text;
        } else if (item.id.startsWith('country.')) {
          context.country = item.short_code;
        }
      }
    }

    return {
      latitude,
      longitude,
      formatted_address: feature.place_name,
      place_name: feature.place_name,
      context,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reverse geocode location');
  }
}

/**
 * Validate Mapbox token is configured
 * 
 * @returns true if token is configured, false otherwise
 */
export function isMapboxConfigured(): boolean {
  return !!MAPBOX_TOKEN && MAPBOX_TOKEN.startsWith('pk.');
}

/**
 * Get Mapbox token for client-side use
 * 
 * @returns Mapbox access token or empty string if not configured
 */
export function getMapboxToken(): string {
  return MAPBOX_TOKEN || '';
}

/**
 * Format coordinates as a string
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param precision - Number of decimal places (default: 6)
 * @returns Formatted coordinate string
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  precision: number = 6
): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}

/**
 * Calculate approximate distance between two points using Haversine formula
 * (For client-side calculations - server uses PostGIS for accuracy)
 * 
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
