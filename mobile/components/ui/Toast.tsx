import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const TYPE_CFG = {
  success: { bg: colors.successBg, text: colors.success, border: colors.successBorder, Icon: CheckCircle },
  error:   { bg: colors.dangerBg,  text: colors.danger,  border: colors.dangerBorder,  Icon: AlertCircle },
  warning: { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder, Icon: AlertTriangle },
  info:    { bg: colors.infoBg,    text: colors.info,    border: colors.infoBorder,    Icon: Info },
};

function ToastBanner({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const cfg = TYPE_CFG[item.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(onDismiss);
    }, item.duration ?? 3500);

    return () => clearTimeout(timer);
  }, [item.id]);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: cfg.bg, borderColor: cfg.border, transform: [{ translateY }], opacity },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <cfg.Icon size={18} color={cfg.text} />
      <Text style={[styles.message, { color: cfg.text }]} numberOfLines={2}>{item.message}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <X size={16} color={cfg.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    setToast({ id: Date.now().toString(), message, type, duration });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <ToastBanner item={toast} onDismiss={hideToast} />}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    zIndex: 9999,
    // Shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  message: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    lineHeight: 20,
  },
});
