export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "../sdk/packages/react/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8652E2',
                secondary: '#6DE8EC',
                'bg-light': '#F8F9FF',
                'bg-dark': '#FFFFFF',
                'surface-light': '#FFFFFF',
                'text-main': '#1A1A2E',
                'text-sub': '#626D85',
                'text-muted': '#626D85', // Alias for Business Platform
                'border-color': '#E5E7EB',
                'border-muted': '#E5E7EB', // Alias for Business Platform
                alerts: '#E63946',
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
