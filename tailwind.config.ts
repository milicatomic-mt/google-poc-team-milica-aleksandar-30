import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          pure: "hsl(var(--background-pure))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption': 'var(--font-size-caption)',
        'body': 'var(--font-size-body)',
        'body-lg': 'var(--font-size-body-lg)',
        'h3': 'var(--font-size-h3)',
        'h2': 'var(--font-size-h2)',
        'h1': 'var(--font-size-h1)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '112': '28rem', // 448px for larger images
        'container': 'var(--container-padding)',
        'section': 'var(--section-padding)',
        'card': 'var(--card-padding)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'card': "var(--radius-lg)",
        'button': "var(--radius-sm)",
      },
      boxShadow: {
        'elegant': 'var(--shadow)',
        'elegant-lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
        'coral': 'var(--shadow-coral)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-subtle': 'var(--gradient-subtle)',
        'gradient-glow': 'var(--gradient-glow)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '200ms',
        'smooth': '300ms',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0"
          },
          "100%": {
            backgroundPosition: "200% 0"
          }
        },
        "glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px hsl(var(--primary) / 0.5)"
          },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.8)"
          }
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)"
          },
          "25%": {
            transform: "translateY(-20px) translateX(10px) rotate(2deg)"
          },
          "50%": {
            transform: "translateY(-10px) translateX(-15px) rotate(-1deg)"
          },
          "75%": {
            transform: "translateY(-30px) translateX(5px) rotate(1deg)"
          }
        },
        "float-medium": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)"
          },
          "33%": {
            transform: "translateY(-25px) translateX(15px) rotate(3deg)"
          },
          "66%": {
            transform: "translateY(-15px) translateX(-20px) rotate(-2deg)"
          }
        },
        "float-fast": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)"
          },
          "50%": {
            transform: "translateY(-35px) translateX(25px) rotate(4deg)"
          }
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 10px hsl(var(--primary) / 0.3)"
          },
          "25%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.5)"
          },
          "50%": {
            transform: "scale(1.1)",
            boxShadow: "0 0 30px hsl(var(--primary) / 0.7)"
          },
          "75%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 20px hsl(var(--primary) / 0.5)"
          }
        },
        "content-appear": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px) scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        },
        "slide-right": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(100vw)"
          }
        },
        "slide-left": {
          "0%": {
            transform: "translateX(100vw)"
          },
          "100%": {
            transform: "translateX(-100%)"
          }
        },
        "spin-sphere": {
          "0%": {
            transform: "rotate(0deg) scale(1)"
          },
          "25%": {
            transform: "rotate(90deg) scale(1.1)"
          },
          "50%": {
            transform: "rotate(180deg) scale(1)"
          },
          "75%": {
            transform: "rotate(270deg) scale(1.1)"
          },
          "100%": {
            transform: "rotate(360deg) scale(1)"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "float-slow": "float-slow 30s ease-in-out infinite",
        "float-medium": "float-medium 20s ease-in-out infinite", 
        "float-fast": "float-fast 15s ease-in-out infinite",
        "pulse-scale": "pulse-scale 3s ease-in-out infinite",
        "content-appear": "content-appear 1.2s ease-out",
        "shimmer": "shimmer 2s infinite",
        "glow": "glow 2s ease-in-out infinite",
        "spin-sphere": "spin-sphere 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
