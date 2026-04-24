import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

// All required status types per design system §7.3
export type BadgeVariant =
  | 'success'      // Paid, Settled
  | 'warning'      // Pending, Under review
  | 'danger'       // Failed
  | 'info'         // Refunded
  | 'neutral'      // Cancelled, Draft
  | 'primary';     // Active, custom

// Non-color status indicators (accessibility: no color-only status)
const STATUS_ICON: Record<string, string> = {
  // Semantic payment statuses
  Paid:          '✓',
  Settled:       '✓✓',
  Pending:       '⏱',
  'Under review': '◎',
  Failed:        '✕',
  Refunded:      '↺',
  Cancelled:     '—',
  // Generic
  Active:        '●',
  Frozen:        '❄',
  Draft:         '○',
  Sent:          '→',
  Overdue:       '!',
};

interface BadgeConfig {
  bg: string;
  text: string;
  border: string;
}

const VARIANT_CFG: Record<BadgeVariant, BadgeConfig> = {
  success: { bg: colors.successBg, text: colors.success, border: colors.successBorder },
  warning: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder },
  danger:  { bg: colors.dangerBg,  text: colors.danger,  border: colors.dangerBorder  },
  info:    { bg: colors.infoBg,    text: colors.info,    border: colors.infoBorder    },
  neutral: { bg: colors.bgCardAlt, text: colors.textSub, border: colors.border        },
  primary: { bg: colors.primaryBg, text: colors.primary, border: `${colors.primary}40` },
};

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  showIcon?: boolean;
}

export function Badge({ text, variant = 'neutral', showIcon = true }: BadgeProps) {
  const cfg = VARIANT_CFG[variant];
  const icon = STATUS_ICON[text];

  return (
    <View
      style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
      accessibilityRole="text"
      accessibilityLabel={text}
    >
      {showIcon && icon && (
        <Text style={[styles.icon, { color: cfg.text }]}>{icon}</Text>
      )}
      <Text style={[styles.text, { color: cfg.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    lineHeight: 13,
  },
  text: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
});
