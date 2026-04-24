// Typography scale — consistent sizing and weights across the app
export const typography = {
  // ── Font sizes ────────────────────────────────────────────
  size: {
    xs:   11,  // captions, badges
    sm:   12,  // secondary labels, timestamps
    base: 14,  // body text, descriptions
    md:   15,  // emphasized body
    lg:   16,  // section labels, button text (lg)
    xl:   18,  // card headings
    '2xl': 20, // screen titles (secondary)
    '3xl': 24, // screen titles
    '4xl': 28, // large headings
    '5xl': 32, // balance amounts (medium)
    '6xl': 40, // hero balance display
  },

  // ── Font weights ──────────────────────────────────────────
  weight: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
    black:     '900' as const,
  },

  // ── Line heights (multipliers) ────────────────────────────
  leading: {
    tight:  1.2,
    snug:   1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose:  2,
  },

  // ── Letter spacing ────────────────────────────────────────
  tracking: {
    tighter: -0.5,
    tight:   -0.25,
    normal:  0,
    wide:    0.5,
    wider:   1,
    widest:  2,
  },
};
