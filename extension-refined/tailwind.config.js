/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html"],
    theme: {
        extend: {
            colors: {
                primary: "#8652E2",
                "background-light": "#F9FAFB",
                "card-light": "#FFFFFF",
                "text-main-light": "#1A1A2E",
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
