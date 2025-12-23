/**
 * Hard-fail Lucide icon resolver using a small allowlist.
 *
 * DO NOT use `import * as LucideIcons from 'lucide-react'` — it pulls the entire icon set
 * into the module graph and destroys Next.js dev compile times.
 */
'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  Users,
  User,
  Tag,
  Layers,
  LayoutDashboard,
  Settings,
  Shield,
  ShieldCheck,
  FolderKanban,
  FileText,
  Clock,
  Calendar,
  TrendingUp,
  Link2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  Cog,
  Wrench,
} from 'lucide-react';

export type LucideIconComponent = React.ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}>;

const ICONS: Record<string, LucideIconComponent> = {
  Activity,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cog,
  FileText,
  FolderKanban,
  Layers,
  LayoutDashboard,
  Link2,
  MapPin,
  Settings,
  Shield,
  ShieldCheck,
  Tag,
  TrendingUp,
  User,
  Users,
  Wrench,
};

function toPascalFromKebab(name: string): string {
  return String(name || '')
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function normalizeKey(name: string): string {
  const raw = String(name || '').trim();
  if (!raw) return '';
  const val = raw.includes(':') ? raw.split(':', 2)[1] : raw;
  if (!val) return '';
  return val.includes('-') || val.includes('_') || val.includes(' ') ? toPascalFromKebab(val) : val;
}

export function resolveLucideIconStrict(name?: string | null): LucideIconComponent {
  const key = normalizeKey(String(name || '').trim());
  if (!key) {
    throw new Error(`[hit-feature-pack-locations] Lucide icon name is empty`);
  }
  const Icon = ICONS[key];
  if (!Icon) {
    throw new Error(
      `[hit-feature-pack-locations] Unknown Lucide icon "${name}" (normalized: "${key}"). ` +
        `Add it to locations/src/utils/lucide-allowlist.tsx or fix the stored icon value.`
    );
  }
  return Icon;
}


