'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAquariums } from '@/lib/actions/aquarium';
import type { Aquarium } from '@/types/aquarium';
import { Fish } from 'lucide-react';

interface AquariumSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
}

export function AquariumSelector({ value, onValueChange, label = "Select Aquarium" }: AquariumSelectorProps) {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAquariums = async () => {
      setLoading(true);
      const result = await getAquariums();
      if (result.aquariums) {
        setAquariums(result.aquariums);
        // Auto-select first aquarium if none selected
        if (!value && result.aquariums.length > 0) {
          onValueChange(result.aquariums[0].id);
        }
      }
      setLoading(false);
    };

    loadAquariums();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading aquariums..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (aquariums.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="p-4 border rounded-md bg-muted/50 text-muted-foreground text-sm">
          <Fish className="h-4 w-4 inline mr-2" />
          No aquariums found. Create an aquarium first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an aquarium" />
        </SelectTrigger>
        <SelectContent>
          {aquariums.map((aquarium) => (
            <SelectItem key={aquarium.id} value={aquarium.id}>
              <div className="flex items-center gap-2">
                <span>{aquarium.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({aquarium.sizeGallons}g, {aquarium.waterType})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {aquariums.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Testing water for {aquariums.find(a => a.id === value)?.name || 'selected aquarium'}
        </p>
      )}
    </div>
  );
}
