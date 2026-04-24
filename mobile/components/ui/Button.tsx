import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

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
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon, iconRight, fullWidth = false, style, textStyle,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = {
    sm: { height: 36, px: 14, fontSize: 13, gap: 6 },
    md: { height: 44, px: 18, fontSize: 14, gap: 8 },
    lg: { height: 52, px: 24, fontSize: 16, gap: 10 },
  }[size];

  const isDisabled = disabled || loading;

  const inner = (
    <View style={[styles.inner, { gap: sizeStyles.gap }]}>
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? colors.white : colors.primary} />
        : icon}
      <Text style={[
        styles.text,
        { fontSize: sizeStyles.fontSize },
        variant === 'secondary' && { color: colors.text },
        variant === 'ghost' && { color: colors.textSub },
        variant === 'danger' && { color: colors.danger },
        variant === 'outline' && { color: colors.primary },
        isDisabled && { opacity: 0.5 },
        textStyle,
      ]}>
        {title}
      </Text>
      {iconRight}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { height: sizeStyles.height, paddingHorizontal: sizeStyles.px },
            isDisabled && { opacity: 0.5 },
          ]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle: ViewStyle = {
    secondary: { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border },
    ghost:     { backgroundColor: 'transparent' },
    danger:    { backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: `${colors.danger}33` },
    outline:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: `${colors.primary}66` },
  }[variant as Exclude<Variant, 'primary'>] ?? {};

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        variantStyle,
        { height: sizeStyles.height, paddingHorizontal: sizeStyles.px },
        isDisabled && { opacity: 0.5 },
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
    borderRadius: 14,
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
    fontWeight: '600',
  },
  fullWidth: { width: '100%' },
});
