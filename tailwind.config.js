/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        talentos: {
          // Paleta principal más moderna y accesible
          primary: '#2563eb',      // Azul medio con buen contraste
          secondary: '#1d4ed8',    // Azul más oscuro para elementos importantes
          accent: '#3b82f6',       // Azul claro para acentos
          dark: '#1e293b',         // Gris oscuro para texto
          light: '#f1f5f9',        // Gris muy claro para fondos
          
          // Nuevos colores para mejor UX
          success: '#059669',      // Verde para éxito
          warning: '#d97706',      // Naranja para advertencias  
          error: '#dc2626',        // Rojo para errores
          info: '#0284c7',         // Azul claro para información
          
          // Grises profesionales
          gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}