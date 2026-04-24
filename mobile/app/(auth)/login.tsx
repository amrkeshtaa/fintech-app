import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Zap, AlertCircle, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/lib/store';
import { loginSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';

const BIO_CREDS_KEY = 'paynow-biometric-creds';

export default function LoginScreen() {
  const login = useAppStore(s => s.login);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [bioLoading, setBioLoading]   = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bioAvailable, setBioAvailable]         = useState(false);
  const [bioSavedCreds, setBioSavedCreds]       = useState(false);
  const [showBioPrompt, setShowBioPrompt]       = useState(false);
  const [pendingEmail, setPendingEmail]         = useState('');
  const [pendingPassword, setPendingPassword]   = useState('');

  useEffect(() => {
    (async () => {
      const hw   = await LocalAuthentication.hasHardwareAsync();
      const enr  = await LocalAuthentication.isEnrolledAsync();
      const cred = await SecureStore.getItemAsync(BIO_CREDS_KEY);
      setBioAvailable(hw && enr);
      setBioSavedCreds(hw && enr && !!cred);
      if (hw && enr && cred) {
        // Auto-prompt biometrics on mount when credentials are saved
        triggerBiometric();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerBiometric = useCallback(async () => {
    setBioLoading(true);
    setGlobalError('');
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your identity',
        cancelLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      if (result.success) {
        const raw = await SecureStore.getItemAsync(BIO_CREDS_KEY);
        if (!raw) { setBioLoading(false); return; }
        const { email: e, password: p } = JSON.parse(raw) as { email: string; password: string };
        const ok = await login(e, p);
        if (ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(app)');
        } else {
          setGlobalError('Biometric credentials are outdated. Please sign in with password.');
          await SecureStore.deleteItemAsync(BIO_CREDS_KEY);
          setBioSavedCreds(false);
        }
      }
    } catch {
      // Biometrics not available / cancelled — silent
    } finally {
      setBioLoading(false);
    }
  }, [login]);

  const enableBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable biometric login',
        cancelLabel: 'Skip',
      });
      if (result.success) {
        await SecureStore.setItemAsync(BIO_CREDS_KEY, JSON.stringify({ email: pendingEmail, password: pendingPassword }));
        setBioSavedCreds(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // ignore
    } finally {
      setShowBioPrompt(false);
      router.replace('/(app)');
    }
  };

  const handleLogin = async () => {
    setGlobalError('');
    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { if (!errs[i.path[0] as string]) errs[i.path[0] as string] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    const ok = await login(trimmedEmail, password);
    setLoading(false);
    if (ok) {
      // Offer biometrics setup if hardware is available but not yet enrolled
      if (bioAvailable && !bioSavedCreds) {
        setPendingEmail(trimmedEmail);
        setPendingPassword(password);
        setShowBioPrompt(true);
      } else {
        router.replace('/(app)');
      }
    } else {
      setGlobalError('Incorrect email or password.');
    }
  };

  if (showBioPrompt) return (
    <View style={styles.bioPromptScreen}>
      <View style={styles.bioIconWrap}>
        <Fingerprint size={52} color={colors.primary} />
      </View>
      <Text style={styles.bioPromptTitle}>Enable Biometric Login?</Text>
      <Text style={styles.bioPromptSub}>
        Sign in faster next time using Face ID or fingerprint — your credentials are stored securely on-device.
      </Text>
      <Button title="Enable Biometrics" onPress={enableBiometrics} fullWidth style={{ marginTop: 12 }} />
      <TouchableOpacity onPress={() => { setShowBioPrompt(false); router.replace('/(app)'); }} style={{ marginTop: 14 }}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Zap size={22} color={colors.white} />
          </View>
          <Text style={styles.logoText}>PayNow</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your PayNow account</Text>

        {/* Demo hint */}
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Demo accounts</Text>
          <Text style={styles.demoLine}>Business: <Text style={styles.demoBold}>alex@coffeehouse.com</Text></Text>
          <Text style={styles.demoLine}>Customer: <Text style={styles.demoBold}>jordan@email.com</Text></Text>
          <Text style={styles.demoLine}>Password: <Text style={styles.demoBold}>Demo@1234!</Text></Text>
        </View>

        {globalError ? (
          <View style={styles.error}>
            <AlertCircle size={15} color={colors.danger} />
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={t => { setEmail(t); setFieldErrors(p => ({ ...p, email: '' })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={t => { setPassword(t); setFieldErrors(p => ({ ...p, password: '' })); }}
            placeholder="••••••••"
            secureTextEntry={!showPass}
            autoComplete="current-password"
            error={fieldErrors.password}
            suffix={
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                {showPass
                  ? <EyeOff size={18} color={colors.textMuted} />
                  : <Eye size={18} color={colors.textMuted} />}
              </TouchableOpacity>
            }
          />

          <Button title="Sign in" onPress={handleLogin} loading={loading} fullWidth size="lg" />

          {/* Biometric button */}
          {bioAvailable && bioSavedCreds && (
            <TouchableOpacity style={styles.bioBtn} onPress={triggerBiometric} disabled={bioLoading}>
              <Fingerprint size={20} color={colors.primaryLight} />
              <Text style={styles.bioBtnText}>
                {bioLoading ? 'Authenticating…' : 'Sign in with Biometrics'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Sign up free</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 80, justifyContent: 'center' },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: colors.text },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSub, marginBottom: 24 },
  demo: { backgroundColor: `${colors.primary}12`, borderRadius: 14, borderWidth: 1, borderColor: `${colors.primary}30`, padding: 14, marginBottom: 20, gap: 4 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: colors.primaryLight, marginBottom: 4 },
  demoLine: { fontSize: 12, color: colors.textSub },
  demoBold: { color: colors.text, fontWeight: '600' },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg, borderRadius: 12, borderWidth: 1, borderColor: `${colors.danger}33`, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  form: { gap: 16, marginBottom: 32 },
  bioBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: `${colors.primary}44`, backgroundColor: `${colors.primary}10` },
  bioBtnText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: colors.textSub, fontSize: 14 },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
  bioPromptScreen: { flex: 1, backgroundColor: colors.bg, padding: 32, justifyContent: 'center', alignItems: 'center' },
  bioIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  bioPromptTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 },
  bioPromptSub: { fontSize: 14, color: colors.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  skipText: { color: colors.textMuted, fontSize: 14 },
});
