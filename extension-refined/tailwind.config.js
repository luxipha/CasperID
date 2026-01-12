/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#8652E2",
                "background-light": "#F9FAFB",
                "background-dark": "#111827",
                "card-light": "#FFFFFF",
                "card-dark": "#1F2937",
                "text-main-light": "#1A1A2E",
                "text-main-dark": "#F9FAFB",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "12px",
            },
        },
    },
    plugins: [],
}
