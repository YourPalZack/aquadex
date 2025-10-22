'use client';

import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { StoreListItem } from '@/types/store';
import { useState, useCallback } from 'react';

export interface StoreMapProps {
  className?: string;
  height?: number | string;
  stores: Array<StoreListItem | { id: string; name?: string; latitude?: number | null; longitude?: number | null; city?: string | null; state?: string | null; slug?: string; business_name?: string; distance_miles?: number | null; }>;
  userLatitude?: number;
  userLongitude?: number;
}

export function StoreMap({ className, height = 420, stores, userLatitude, userLongitude }: StoreMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Choose a sensible default center: continental US
  const defaultCenter = { latitude: 39.8283, longitude: -98.5795, zoom: 3.5 };

  const firstWithCoords = stores.find((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number');
  const initialViewState = typeof userLatitude === 'number' && typeof userLongitude === 'number'
    ? { latitude: userLatitude, longitude: userLongitude, zoom: 9 }
    : firstWithCoords && typeof firstWithCoords.latitude === 'number' && typeof firstWithCoords.longitude === 'number'
    ? { latitude: firstWithCoords.latitude!, longitude: firstWithCoords.longitude!, zoom: 9 }
    : defaultCenter;

  const hasCoords = stores.some((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number');

  if (!token) {
    return (
      <div className={cn('w-full rounded-lg border bg-muted p-4 text-sm text-muted-foreground', className)} style={{ height }}>
        Map is unavailable. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local.
      </div>
    );
  }

  if (!hasCoords) {
    return (
      <div className={cn('w-full rounded-lg border bg-muted p-4 text-sm text-muted-foreground', className)} style={{ height }}>
        Map will appear here when store coordinates are available.
      </div>
    );
  }

  const selected = selectedId ? stores.find((s) => s.id === selectedId) : null;

  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)} style={{ height }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState as any}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-left" />
        {typeof userLatitude === 'number' && typeof userLongitude === 'number' && (
          <Marker latitude={userLatitude} longitude={userLongitude} anchor="center">
            <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow" aria-label="Your location" />
          </Marker>
        )}
        {stores.map((s) => {
          if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number') return null;
          const title = (('business_name' in s && s.business_name) ? s.business_name : (('name' in s && s.name) ? s.name : 'Store')) as string;
          return (
            <Marker key={s.id} latitude={s.latitude} longitude={s.longitude} anchor="bottom">
              <button
                onClick={() => setSelectedId(s.id)}
                className="flex items-center gap-1 bg-background/90 backdrop-blur rounded-md px-2 py-1 shadow border hover:bg-background"
                aria-label={`View ${title}`}
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{title}</span>
              </button>
            </Marker>
          );
        })}

        {selected && typeof selected.latitude === 'number' && typeof selected.longitude === 'number' && (
          <Popup
            latitude={selected.latitude}
            longitude={selected.longitude}
            anchor="top"
            onClose={() => setSelectedId(null)}
            closeOnClick={false}
          >
            <div className="text-sm">
              <div className="font-medium">{(('business_name' in selected && selected.business_name) ? selected.business_name : (('name' in selected && selected.name) ? selected.name : 'Store')) as string}</div>
              {(selected.city || selected.state) && (
                <div className="text-muted-foreground text-xs">{selected.city}{selected.city && selected.state ? ', ' : ''}{selected.state}</div>
              )}
              {typeof selected.distance_miles === 'number' && (
                <div className="text-muted-foreground text-xs">{selected.distance_miles.toFixed(1)} mi away</div>
              )}
              {selected.slug && (
                <Link className="text-primary hover:underline text-xs" href={`/local-fish-stores/${selected.slug}`}>View details</Link>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
