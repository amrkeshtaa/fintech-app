// Light teal design system — trustworthy, modern, accessible
export const colors = {
  // ── Backgrounds ──────────────────────────────────────────
  bg:         '#F8FAFC',  // slate-50  — page background
  bgCard:     '#FFFFFF',  // pure white cards
  bgCardAlt:  '#F1F5F9',  // slate-100 — subtle section tint
  bgElevated: '#F1F5F9',  // slate-100 — elevated surfaces

  // ── Brand — Teal (trust + digital + modern) ───────────────
  primary:      '#0D9488',  // teal-600
  primaryLight: '#14B8A6',  // teal-500  — links, secondary text
  primaryDark:  '#0F766E',  // teal-700  — pressed states
  primaryBg:    '#F0FDFA',  // teal-50   — subtle tinted bg

  // ── Accent ────────────────────────────────────────────────
  purple:      '#7C3AED',  // violet-600 — secondary accent
  purpleLight: '#8B5CF6',  // violet-500
  purpleBg:    '#F5F3FF',  // violet-50

  // ── Text hierarchy ────────────────────────────────────────
  text:        '#0F172A',  // slate-900  — dark navy, primary text
  textSub:     '#475569',  // slate-600  — secondary text
  textMuted:   '#94A3B8',  // slate-400  — placeholder / captions
  textOnDark:  '#FFFFFF',  // text on colored backgrounds

  // ── Status ────────────────────────────────────────────────
  success:       '#059669',  // emerald-600
  successBg:     '#ECFDF5',  // emerald-50
  successBorder: '#A7F3D0',  // emerald-200

  warning:       '#D97706',  // amber-600
  warningBg:     '#FFFBEB',  // amber-50
  warningBorder: '#FDE68A',  // amber-200

  danger:        '#DC2626',  // red-600
  dangerBg:      '#FEF2F2',  // red-50
  dangerBorder:  '#FECACA',  // red-200

  info:          '#2563EB',  // blue-600
  infoBg:        '#EFF6FF',  // blue-50
  infoBorder:    '#BFDBFE',  // blue-200

  // ── Borders ───────────────────────────────────────────────
  border:      '#E2E8F0',  // slate-200
  borderLight: '#F1F5F9',  // slate-100
  borderDark:  '#CBD5E1',  // slate-300
  borderFocus: '#0D9488',  // teal — focused input rings

  // ── Premium gradients (virtual card & balance hero) ───────
  gradStart: '#0F766E',  // teal-700
  gradMid:   '#0D9488',  // teal-600
  gradEnd:   '#0891B2',  // cyan-600

  // ── Shadows (for light-theme elevation) ───────────────────
  shadow:   '#64748B',   // slate-500

  // ── Utility ───────────────────────────────────────────────
  white:    '#FFFFFF',
  black:    '#0F172A',
  overlay:  'rgba(15,23,42,0.5)',
};

export type Color = keyof typeof colors;
