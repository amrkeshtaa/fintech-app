import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Building2, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAppStore } from '@/lib/store';
import { registerSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';

type Step = 0 | 1 | 2;

export default function RegisterScreen() {
  const register = useAppStore(s => s.register);
  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<'business' | 'customer'>('business');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', businessName: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const set = (k: string) => (v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setFieldErrors(p => ({ ...p, [k]: '' }));
  };

  const passStrength = (() => {
    let s = 0;
    const p = form.password;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColors = ['', colors.danger, colors.warning, colors.primary, colors.success];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const validateAndNext = () => {
    const result = registerSchema.safeParse({ ...form, role });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { if (!errs[i.path[0] as string]) errs[i.path[0] as string] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setGlobalError('');
    const ok = await register({ ...form, role });
    setLoading(false);
    if (ok) { router.replace('/(app)'); }
    else { setGlobalError(useAppStore.getState().authError); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => step === 0 ? router.back() : setStep(s => (s - 1) as Step)} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>

        {/* Steps */}
        <View style={styles.steps}>
          {['Type', 'Details', 'Confirm'].map((l, i) => (
            <View key={l} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && { backgroundColor: i < step ? colors.success : colors.primary }]}>
                {i < step
                  ? <CheckCircle size={14} color={colors.white} />
                  : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepLabel, i === step && { color: colors.text }]}>{l}</Text>
            </View>
          ))}
        </View>

        {globalError ? (
          <View style={styles.error}>
            <AlertCircle size={15} color={colors.danger} />
            <Text style={styles.errorText}>{globalError}</Text>
          </View>
        ) : null}

        {/* Step 0 — Role */}
        {step === 0 && (
          <View style={styles.roleContainer}>
            {([
              { r: 'business' as const, icon: <Building2 size={26} color={colors.white} />, title: 'Business / Freelancer', desc: 'Accept payments, invoices, POS' },
              { r: 'customer' as const, icon: <User size={26} color={colors.white} />, title: 'Customer / Individual', desc: 'Pay, virtual card, spending tracker' },
            ] as const).map(({ r, icon, title, desc }) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleCard, role === r && styles.roleCardActive]}
                onPress={() => { setRole(r); setStep(1); }}
              >
                <View style={[styles.roleIcon, { backgroundColor: r === 'business' ? colors.primary : colors.purple }]}>
                  {icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>{title}</Text>
                  <Text style={styles.roleDesc}>{desc}</Text>
                </View>
                <Text style={styles.roleArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <View style={styles.form}>
            <Input label="Full name" value={form.name} onChangeText={set('name')} placeholder="John Doe" error={fieldErrors.name} />
            {role === 'business' && (
              <Input label="Business name" value={form.businessName} onChangeText={set('businessName')} placeholder="My Business LLC" error={fieldErrors.businessName} />
            )}
            <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={fieldErrors.email} />
            <Input label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" error={fieldErrors.phone} />
            <View>
              <Input
                label="Password"
                value={form.password}
                onChangeText={set('password')}
                placeholder="Min 8 chars, uppercase, number, symbol"
                secureTextEntry={!showPass}
                error={fieldErrors.password}
                suffix={
                  <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                  </TouchableOpacity>
                }
              />
              {form.password.length > 0 && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  <View style={styles.strengthBars}>
                    {[1,2,3,4].map(i => (
                      <View key={i} style={[styles.strengthBar, i <= passStrength && { backgroundColor: strengthColors[passStrength] }]} />
                    ))}
                  </View>
                  <Text style={{ fontSize: 11, color: strengthColors[passStrength] }}>{strengthLabels[passStrength]}</Text>
                </View>
              )}
            </View>
            <Button title="Continue" onPress={validateAndNext} fullWidth size="lg" />
          </View>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.confirmCard}>
              {[
                ['Name', form.name],
                ['Role', role === 'business' ? 'Business / Freelancer' : 'Customer'],
                ...(form.businessName ? [['Business', form.businessName]] : []),
                ['Email', form.email],
                ['Phone', form.phone],
              ].map(([l, v]) => (
                <View key={l} style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>{l}</Text>
                  <Text style={styles.confirmValue} numberOfLines={1}>{v}</Text>
                </View>
              ))}
            </View>
            <Button title="Create account" onPress={handleSubmit} loading={loading} fullWidth size="lg" />
            <Text style={styles.terms}>By creating an account you agree to our Terms of Service.</Text>
          </View>
        )}

        {step === 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 20 },
  backText: { color: colors.primaryLight, fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 24 },
  steps: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bgElevated, justifyContent: 'center', alignItems: 'center' },
  stepNum: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  stepLabel: { fontSize: 12, color: colors.textMuted },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.dangerBg, borderRadius: 12, borderWidth: 1, borderColor: `${colors.danger}33`, padding: 12, marginBottom: 16 },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  roleContainer: { gap: 14 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  roleCardActive: { borderColor: `${colors.primary}60`, backgroundColor: `${colors.primary}10` },
  roleIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  roleDesc: { color: colors.textSub, fontSize: 12, marginTop: 2 },
  roleArrow: { color: colors.textMuted, fontSize: 22 },
  form: { gap: 16 },
  strengthBars: { flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.bgElevated },
  confirmCard: { backgroundColor: colors.bgCard, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between' },
  confirmLabel: { color: colors.textSub, fontSize: 13 },
  confirmValue: { color: colors.text, fontSize: 13, fontWeight: '600', maxWidth: '60%' },
  terms: { textAlign: 'center', color: colors.textMuted, fontSize: 11 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.textSub, fontSize: 14 },
  link: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
});
