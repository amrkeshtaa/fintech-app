import { I18nManager } from 'react-native';

// RTL detection — respects device locale setting
export const isRTL = I18nManager.isRTL;

// Flip a flex-row direction for RTL layouts
export const rowDirection = isRTL ? 'row-reverse' : 'row';

// Text alignment that follows reading direction
export const textAlign = isRTL ? ('right' as const) : ('left' as const);

// Start / end padding helpers (logical properties shim)
export const paddingStart = isRTL ? 'paddingRight' : 'paddingLeft';
export const paddingEnd   = isRTL ? 'paddingLeft'  : 'paddingRight';
export const marginStart  = isRTL ? 'marginRight'  : 'marginLeft';
export const marginEnd    = isRTL ? 'marginLeft'   : 'marginRight';

// Flip a value (e.g. icon rotation) for RTL
export const flipForRTL = (value: number): number => (isRTL ? -value : value);

// Force RTL layout (call once at app startup if locale is Arabic)
export function forceRTL(enable: boolean) {
  if (I18nManager.isRTL !== enable) {
    I18nManager.forceRTL(enable);
    // App restart required for the change to take full effect
  }
}

// i18n string catalog — extend with Arabic keys as needed
export type LangKey =
  | 'welcome_back'
  | 'sign_in'
  | 'sign_up'
  | 'email'
  | 'password'
  | 'balance'
  | 'send'
  | 'receive'
  | 'home'
  | 'wallet'
  | 'cards'
  | 'analytics'
  | 'more';

const en: Record<LangKey, string> = {
  welcome_back: 'Welcome back',
  sign_in:      'Sign in',
  sign_up:      'Create account',
  email:        'Email',
  password:     'Password',
  balance:      'Balance',
  send:         'Send',
  receive:      'Receive',
  home:         'Home',
  wallet:       'Wallet',
  cards:        'Cards',
  analytics:    'Analytics',
  more:         'More',
};

const ar: Record<LangKey, string> = {
  welcome_back: 'مرحباً بعودتك',
  sign_in:      'تسجيل الدخول',
  sign_up:      'إنشاء حساب',
  email:        'البريد الإلكتروني',
  password:     'كلمة المرور',
  balance:      'الرصيد',
  send:         'إرسال',
  receive:      'استقبال',
  home:         'الرئيسية',
  wallet:       'المحفظة',
  cards:        'البطاقات',
  analytics:    'التحليلات',
  more:         'المزيد',
};

// Current locale — toggle to 'ar' to switch language
let currentLocale: 'en' | 'ar' = 'en';
const catalogs = { en, ar };

export function setLocale(locale: 'en' | 'ar') {
  currentLocale = locale;
  forceRTL(locale === 'ar');
}

export function t(key: LangKey): string {
  return catalogs[currentLocale][key] ?? key;
}
