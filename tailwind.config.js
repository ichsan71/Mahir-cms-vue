/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        // ── MAHIR design tokens (ported from admin-theme.scss :root) ──
        mahir: {
          primary: "#243B8F",
          "primary-soft": "#E7EEFF",
          "sidebar-bg": "#111D3D",
          "sidebar-hdr": "#0C1530",
          "sidebar-active": "#243B8F",
          bg: "#F4F7FB",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          muted: "#526277",
          "success-soft": "#E2F8EC",
          "warning-soft": "#FFF3DA",
          "danger-soft": "#FCE7E7",
          "info-soft": "#E4F1FF",
          success: "#1B9C67",
          warning: "#D98E18",
          danger: "#D14343",
          info: "#2884E8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
