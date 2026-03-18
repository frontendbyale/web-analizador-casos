// tailwind.config.mjs
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Colores primarios/acentos (basados en indigo y green del uso actual)
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Indigo-like
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // Green-like para éxito/descarga
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // Colores semánticos (basados en amber y red del uso actual para warnings/errors)
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // Colores de fondo y superficie (basados en slate)
        background: 'hsl(var(--background))', // Para el fondo de la página
        foreground: 'hsl(var(--foreground))', // Para texto principal

        card: {
          DEFAULT: 'hsl(var(--card))', // Para Cards y contenedores de contenido
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Texto secundario, fondos sutiles
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [], // Shadcn/UI y otros plugins de Tailwind se añadirán aquí.
});