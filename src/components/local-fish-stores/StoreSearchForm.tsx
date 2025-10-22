'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';

const searchSchema = z.object({
  q: z.string().optional(),
  categories: z.array(z.enum(['freshwater','saltwater','plants','reptiles','general'])).optional(),
  radius: z.number().min(1).max(250).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pageSize: z.number().min(6).max(60).optional(),
});

export type StoreSearchValues = z.infer<typeof searchSchema>;

interface StoreSearchFormProps {
  defaultValues?: Partial<StoreSearchValues>;
  onSearch: (values: StoreSearchValues) => void;
}

export function StoreSearchForm({ defaultValues, onSearch }: StoreSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [values, setValues] = useState<StoreSearchValues>({
    q: defaultValues?.q || '',
    categories: defaultValues?.categories || [],
    radius: defaultValues?.radius || 25,
    latitude: defaultValues?.latitude,
    longitude: defaultValues?.longitude,
    pageSize: defaultValues?.pageSize || 24,
  });

  type Cat = 'freshwater'|'saltwater'|'plants'|'reptiles'|'general';
  const toggleCategory = (c: Cat) => {
    setValues((v) => {
      const set = new Set<Cat>(v.categories as Cat[] || []);
      if (set.has(c)) set.delete(c); else set.add(c);
      return { ...v, categories: Array.from(set) };
    });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setValues((v) => ({ ...v, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = searchSchema.safeParse(values);
    if (!parsed.success) return;
    onSearch(parsed.data);

    // Build query string and navigate to trigger SSR refresh
    const params = new URLSearchParams();
    if (parsed.data.q) params.set('q', parsed.data.q);
    if (parsed.data.categories && parsed.data.categories.length) params.set('categories', parsed.data.categories.join(','));
    if (parsed.data.latitude && parsed.data.longitude) {
      params.set('lat', String(parsed.data.latitude));
      params.set('lng', String(parsed.data.longitude));
    }
    if (parsed.data.radius) params.set('radius', String(parsed.data.radius));
    if (parsed.data.pageSize) params.set('pageSize', String(parsed.data.pageSize));
    // Reset to first page on new search
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const cats = [
    { value: 'freshwater', label: 'Freshwater' },
    { value: 'saltwater', label: 'Saltwater' },
    { value: 'plants', label: 'Plants' },
    { value: 'reptiles', label: 'Reptiles' },
    { value: 'general', label: 'General' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="q" value={values.q || ''} onChange={(e) => setValues({ ...values, q: e.target.value })} className="pl-9" placeholder="Name, city, state, zip" />
            </div>
          </div>

          <div>
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <Label key={c.value} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={!!values.categories?.includes(c.value as any)} onChange={() => toggleCategory(c.value as Cat)} className="rounded" />
                  {c.label}
                </Label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="radius">Radius (mi)</Label>
            <div className="flex gap-2">
              <Input id="radius" type="number" min={1} max={250} value={values.radius ?? ''} onChange={(e) => setValues({ ...values, radius: e.target.value ? Number(e.target.value) : undefined })} className="w-24" />
              <Button type="button" variant="outline" onClick={handleUseLocation}>
                <MapPin className="h-4 w-4 mr-2" /> Use location
              </Button>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div>
              <Label htmlFor="pageSize">Per page</Label>
              <select id="pageSize" className="border rounded h-9 px-2" value={values.pageSize} onChange={(e) => setValues({ ...values, pageSize: Number(e.target.value) })}>
                {[12,24,36,48].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <Button type="button" variant="outline" onClick={handleUseLocation}>
              <MapPin className="h-4 w-4 mr-2" /> Use location
            </Button>
            <Button type="submit">Search</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
