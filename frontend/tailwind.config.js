export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
                secondary: 'rgb(var(--secondary-rgb) / <alpha-value>)',
                canvas: 'rgb(var(--canvas-rgb) / <alpha-value>)',
                surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
                'surface-muted': 'rgb(var(--surface-muted-rgb) / <alpha-value>)',
                'surface-elevated': 'rgb(var(--surface-elevated-rgb) / <alpha-value>)',
                'bg-light': 'rgb(var(--canvas-rgb) / <alpha-value>)',
                'bg-dark': 'rgb(var(--surface-rgb) / <alpha-value>)',
                'surface-light': 'rgb(var(--surface-rgb) / <alpha-value>)',
                'text-main': 'rgb(var(--text-main-rgb) / <alpha-value>)',
                'text-sub': 'rgb(var(--text-sub-rgb) / <alpha-value>)',
                'text-muted': 'rgb(var(--text-sub-rgb) / <alpha-value>)',
                'border-color': 'rgb(var(--border-subtle-rgb) / <alpha-value>)',
                'border-muted': 'rgb(var(--border-subtle-rgb) / <alpha-value>)',
                'border-subtle': 'rgb(var(--border-subtle-rgb) / <alpha-value>)',
                'border-strong': 'rgb(var(--border-strong-rgb) / <alpha-value>)',
                alerts: 'rgb(var(--alerts-rgb) / <alpha-value>)',
                // CasperOS (RestoTech) Colors
                'os-primary': '#e67e22',
                'os-secondary': '#6DE8EC',
                'midnight': '#2c3e50',
                'midnight-darker': '#16212c',
                'forest-dark': '#2d4030',
                'background-light': '#f9f9f9',
                'background-dark': '#1d2630',
                'integration-dark': '#16212c',
                'dashboard-bg': '#1a252f',
                'charcoal': '#36454F',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
                display: ['Manrope', 'sans-serif'],
                'serif-quote': ['Playfair Display', 'serif'],
                'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(134, 82, 226, 0.08)',
                'glow': '0 0 15px rgba(134, 82, 226, 0.3)',
            },
            keyframes: {
                loading: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(300%)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' },
                }
            },
            animation: {
                loading: 'loading 2s linear infinite',
                'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-out-right': 'slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }
        }
    },
    plugins: [],
}
