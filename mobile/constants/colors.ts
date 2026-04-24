export const colors = {
  bg:          '#090e1a',
  bgCard:      '#111827',
  bgCardAlt:   '#1a2234',
  bgElevated:  '#1e293b',

  primary:       '#6366f1',
  primaryLight:  '#818cf8',
  primaryDark:   '#4f46e5',
  purple:        '#8b5cf6',
  purpleLight:   '#a78bfa',

  text:        '#f1f5f9',
  textSub:     '#94a3b8',
  textMuted:   '#475569',

  success:     '#10b981',
  successBg:   'rgba(16,185,129,0.12)',
  warning:     '#f59e0b',
  warningBg:   'rgba(245,158,11,0.12)',
  danger:      '#ef4444',
  dangerBg:    'rgba(239,68,68,0.12)',
  info:        '#3b82f6',
  infoBg:      'rgba(59,130,246,0.12)',

  border:      'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.13)',

  // Card gradient stops
  gradStart:   '#6366f1',
  gradMid:     '#8b5cf6',
  gradEnd:     '#a855f7',

  white:       '#ffffff',
  black:       '#000000',
};

export type Color = keyof typeof colors;
