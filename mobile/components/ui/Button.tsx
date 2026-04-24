import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

// Minimum tap areas: sm=40, md=48, lg=56 (WCAG 2.5.5 AAA = 44pt)
const SIZE = {
  sm: { height: 40, px: 16, fontSize: typography.size.sm, gap: 6, radius: 12 },
  md: { height: 48, px: 20, fontSize: typography.size.base, gap: 8, radius: 14 },
  lg: { height: 56, px: 24, fontSize: typography.size.lg, gap: 10, radius: 16 },
};

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon, iconRight, fullWidth = false,
  style, textStyle, accessibilityLabel, children,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const s = SIZE[size];
  const isDisabled = disabled || loading;

  const inner = (
    <View style={[styles.inner, { gap: s.gap }]}>
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? colors.white : colors.primary} />
        : icon}
      <Text
        style={[
          styles.text,
          { fontSize: s.fontSize },
          variant === 'secondary' && { color: colors.text },
          variant === 'ghost'     && { color: colors.primary },
          variant === 'danger'    && { color: colors.danger },
          variant === 'outline'   && { color: colors.primary },
          isDisabled && styles.disabledText,
          textStyle,
        ]}
        accessibilityRole="text"
      >
        {title}
      </Text>
      {iconRight}
      {children}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { height: s.height, paddingHorizontal: s.px, borderRadius: s.radius },
            isDisabled && styles.disabled,
          ]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle: ViewStyle = ({
    secondary: {
      backgroundColor: colors.bgCard,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.dangerBg,
      borderWidth: 1.5,
      borderColor: colors.dangerBorder,
    },
    outline: {
      backgroundColor: colors.primaryBg,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
  } as Record<Exclude<Variant, 'primary'>, ViewStyle>)[variant as Exclude<Variant, 'primary'>] ?? {};

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        variantStyle,
        { height: s.height, paddingHorizontal: s.px, borderRadius: s.radius },
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.1,
  },
  disabled: { opacity: 0.45 },
  disabledText: {},
  fullWidth: { width: '100%' },
});
