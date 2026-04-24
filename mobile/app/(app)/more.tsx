import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  FileText, Link, Smartphone, User, Shield, Bell,
  HelpCircle, LogOut, ChevronRight, Send, QrCode,
  type LucideIcon,
} from 'lucide-react-native';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  sub?: string;
  href?: string;
  onPress?: () => void;
  color?: string;
  badge?: string;
}

export default function MoreScreen() {
  const { user, logout } = useAppStore();
  if (!user) return null;

  const isBiz = user.role === 'business';

  const BUSINESS: MenuItem[] = [
    { icon: FileText,    label: 'Invoices',       sub: 'Create & track invoices',    href: '/(app)/invoices',       color: colors.success },
    { icon: Link,        label: 'Payment Links',  sub: 'Shareable payment pages',    href: '/(app)/payment-links',  color: colors.purple },
    { icon: Smartphone,  label: 'Point of Sale',  sub: 'Accept in-person payments',  href: '/(app)/pos',            color: colors.warning },
  ];

  const MONEY: MenuItem[] = [
    { icon: Send,        label: 'Send Money',   sub: 'Transfer to contacts',  href: '/(app)/send',    color: colors.primary },
    { icon: QrCode,      label: 'Receive',      sub: 'Your QR & payment link', href: '/(app)/receive', color: colors.purple },
  ];

  const ACCOUNT: MenuItem[] = [
    { icon: User,        label: 'Profile',         sub: user.email,               color: colors.textSub },
    { icon: Shield,      label: 'Security',         sub: 'PIN, biometrics, 2FA',   color: colors.info },
    { icon: Bell,        label: 'Notifications',    sub: 'Manage alerts',          color: colors.warning },
    { icon: HelpCircle,  label: 'Help & Support',   sub: 'FAQs and contact us',    color: colors.textSub },
    {
      icon: LogOut, label: 'Sign Out', color: colors.danger,
      onPress: () => { logout(); router.replace('/(auth)/login'); },
    },
  ];

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.label}
      style={styles.menuItem}
      onPress={item.onPress ?? (() => item.href && router.push(item.href as any))}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color ?? colors.primary}20` }]}>
        <item.icon size={18} color={item.color ?? colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, item.label === 'Sign Out' && { color: colors.danger }]}>{item.label}</Text>
        {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
      </View>
      {item.badge && (
        <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
      )}
      {item.href && <ChevronRight size={16} color={colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>More</Text>

      {/* Profile card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user.businessName ?? user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{isBiz ? '🏢 Business' : '👤 Customer'}</Text>
          </View>
        </View>
      </Card>

      {/* Business tools */}
      {isBiz && (
        <>
          <Text style={styles.sectionTitle}>Business Tools</Text>
          <Card style={{ gap: 0 }}>
            {BUSINESS.map(renderItem)}
          </Card>
        </>
      )}

      {/* Quick money */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <Card style={{ gap: 0 }}>
        {MONEY.map(renderItem)}
      </Card>

      {/* Account */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Card style={{ gap: 0 }}>
        {ACCOUNT.map(renderItem)}
      </Card>

      <Text style={styles.version}>PayNow v1.0.0 · Built with Expo</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60, gap: 12, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  profileAvatarText: { color: colors.white, fontWeight: '800', fontSize: 22 },
  profileName: { color: colors.text, fontWeight: '700', fontSize: 16 },
  profileEmail: { color: colors.textSub, fontSize: 13, marginTop: 2 },
  rolePill: { backgroundColor: `${colors.primary}20`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  roleText: { color: colors.primaryLight, fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2, paddingHorizontal: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { color: colors.text, fontWeight: '600', fontSize: 14 },
  menuSub: { color: colors.textSub, fontSize: 12, marginTop: 1 },
  badge: { backgroundColor: colors.danger, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginRight: 6 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 8 },
});
