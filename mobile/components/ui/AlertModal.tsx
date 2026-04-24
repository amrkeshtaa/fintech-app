import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import { Button } from './Button';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type AlertType = 'success' | 'warning' | 'danger' | 'info';

interface AlertAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface AlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
}

const TYPE_CFG = {
  success: { Icon: CheckCircle, color: colors.success, bg: colors.successBg },
  warning: { Icon: AlertTriangle, color: colors.warning, bg: colors.warningBg },
  danger:  { Icon: AlertCircle, color: colors.danger, bg: colors.dangerBg },
  info:    { Icon: Info, color: colors.info, bg: colors.infoBg },
};

export function AlertModal({
  visible, type = 'info', title, message,
  actions, onDismiss,
}: AlertModalProps) {
  const { Icon, color, bg } = TYPE_CFG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
        accessible={false}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <Icon size={28} color={color} />
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Actions */}
          {actions && actions.length > 0 ? (
            <View style={[styles.actions, actions.length > 1 && styles.actionsRow]}>
              {actions.map((a, i) => (
                <Button
                  key={i}
                  title={a.label}
                  onPress={a.onPress}
                  variant={a.variant ?? (i === 0 ? 'primary' : 'secondary')}
                  style={{ flex: actions.length > 1 ? 1 : undefined, minWidth: 100 }}
                  fullWidth={actions.length === 1}
                />
              ))}
            </View>
          ) : (
            <Button title="OK" onPress={onDismiss ?? (() => {})} fullWidth />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.base,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  actions: { width: '100%', gap: 10, marginTop: 4 },
  actionsRow: { flexDirection: 'row' },
});
