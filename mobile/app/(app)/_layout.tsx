import { Redirect, Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LayoutDashboard, Wallet, CreditCard, BarChart3, Grid } from 'lucide-react-native';
import { useAppStore } from '@/lib/store';
import { colors } from '@/constants/colors';

const HIDDEN = { tabBarButton: () => null, tabBarStyle: { display: 'none' as const } };

export default function AppLayout() {
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBg} />,
      }}
    >
      <Tabs.Screen name="index"         options={{ title: 'Home',      tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tabs.Screen name="wallet"        options={{ title: 'Wallet',    tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} /> }} />
      <Tabs.Screen name="cards"         options={{ title: 'Cards',     tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} /> }} />
      <Tabs.Screen name="analytics"     options={{ title: 'Analytics', tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }} />
      <Tabs.Screen name="more"          options={{ title: 'More',      tabBarIcon: ({ color, size }) => <Grid size={size} color={color} /> }} />

      {/* Non-tab screens — navigable but hidden from tab bar */}
      <Tabs.Screen name="send"          options={HIDDEN} />
      <Tabs.Screen name="receive"       options={HIDDEN} />
      <Tabs.Screen name="pos"           options={HIDDEN} />
      <Tabs.Screen name="invoices"      options={HIDDEN} />
      <Tabs.Screen name="payment-links" options={HIDDEN} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgCard,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 18,
    paddingTop: 10,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  tabBg: { flex: 1, backgroundColor: colors.bgCard },
});
