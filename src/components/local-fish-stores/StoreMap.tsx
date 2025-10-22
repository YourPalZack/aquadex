'use client';

import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StoreMapProps {
  className?: string;
  height?: number | string;
  stores: Array<{
    id: string;
    business_name?: string;
    name?: string; // for mock fallback
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
    state?: string | null;
  }>;
}

export function StoreMap({ className, height = 420, stores }: StoreMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Choose a sensible default center: continental US
  const defaultCenter = { latitude: 39.8283, longitude: -98.5795, zoom: 3.5 };

  const firstWithCoords = stores.find((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number');
  const initialViewState = firstWithCoords && typeof firstWithCoords.latitude === 'number' && typeof firstWithCoords.longitude === 'number'
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

  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)} style={{ height }}>
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState as any}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-left" />
        {stores.map((s) => {
          if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number') return null;
          const title = s.business_name || s.name || 'Store';
          return (
            <Marker key={s.id} latitude={s.latitude} longitude={s.longitude} anchor="bottom">
              <div className="flex items-center gap-1 bg-background/90 backdrop-blur rounded-md px-2 py-1 shadow border">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{title}</span>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
