/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // تفعيل الوضع الليلي باستخدام فئة 'dark'
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ألوان الوضع النهاري المحسّنة لمظهر أكثر وضوحاً وأقل بياضاً (يجب تعريفها في ملف CSS عام مثل globals.css)
        // هذه القيم توفر تباينًا أفضل مع الحفاظ على الأسلوب النظيف.
        border: "var(--color-border)",       /* حدود رمادية متوسطة الوضوح: HSL(220 10% 80%) */
        input: "var(--color-input)",         /* أبيض ناصع للمدخلات: HSL(0 0% 100%) */
        ring: "var(--color-ring)",           /* أزرق فاتح للتركيز: HSL(214 91% 60%) */
        background: "var(--color-background)", /* أبيض نظيف للخلفية الرئيسية: HSL(0 0% 100%) */
        foreground: "var(--color-foreground)", /* رمادي داكن للنصوص: HSL(220 13% 15%) */
        primary: {
          DEFAULT: "var(--color-primary)",   /* أزرق أساسي: HSL(214 91% 60%) */
          foreground: "var(--color-primary-foreground)", /* أبيض للنصوص على الأساسي: HSL(0 0% 100%) */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* رمادي فاتح جداً للخلفيات الثانوية: HSL(220 13% 97%) */
          foreground: "var(--color-secondary-foreground)", /* رمادي داكن للنصوص على الثانوي: HSL(220 13% 25%) */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* أحمر للتنبيهات الخطيرة: HSL(0 84% 60%) */
          foreground: "var(--color-destructive-foreground)", /* أبيض للنصوص على التنبيهات الخطيرة: HSL(0 0% 100%) */
        },
        muted: {
          DEFAULT: "var(--color-muted)",     /* رمادي هادئ للخلفيات الصامتة: HSL(220 13% 95%) */
          foreground: "var(--color-muted-foreground)", /* رمادي متوسط للنصوص الصامتة: HSL(220 13% 45%) */
        },
        accent: {
          DEFAULT: "var(--color-accent)",    /* أزرق فاتح للتمييز: HSL(214 91% 60%) */
          foreground: "var(--color-accent-foreground)", /* أبيض للنصوص على التمييز: HSL(0 0% 100%) */
        },
        popover: {
          DEFAULT: "var(--color-popover)",   /* أبيض للقوائم المنبثقة: HSL(0 0% 100%) */
          foreground: "var(--color-popover-foreground)", /* رمادي داكن للنصوص على القوائم: HSL(220 13% 15%) */
        },
        card: {
          DEFAULT: "var(--color-card)",      /* أبيض للبطاقات: HSL(0 0% 100%) */
          foreground: "var(--color-card-foreground)", /* رمادي داكن للنصوص على البطاقات: HSL(220 13% 15%) */
        },
        success: {
          DEFAULT: "var(--color-success)",   /* أخضر للنجاح: HSL(142 76% 40%) */
          foreground: "var(--color-success-foreground)", /* أبيض للنصوص على النجاح: HSL(0 0% 100%) */
        },
        warning: {
          DEFAULT: "var(--color-warning)",   /* برتقالي للتحذير: HSL(38 92% 50%) */
          foreground: "var(--color-warning-foreground)", /* رمادي داكن للنصوص على التحذير: HSL(220 13% 15%) */
        },
        error: {
          DEFAULT: "var(--color-error)",     /* أحمر للأخطاء: HSL(0 84% 60%) */
          foreground: "var(--color-error-foreground)", /* أبيض للنصوص على الأخطاء: HSL(0 0% 100%) */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'heading': ['Tajawal', 'sans-serif'],
        'body': ['Noto Sans Arabic', 'sans-serif'],
        'caption': ['Cairo', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
        'sans': ['Noto Sans Arabic', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 200ms ease-out",
        "slide-in": "slideIn 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slideIn": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      backdropBlur: {
        xs: '2px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
