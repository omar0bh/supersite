import React from 'react';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

    :root {
      --primary: #0F0F0F;
      --accent-primary: #1E90FF;
      --accent-secondary: #3FE0C5;
      --neutral: #E0E0E0;
      --color-bg: #F4F7FB;
      --surface-primary: #FFFFFF;
      --surface-muted: #EEF2F6;
      --text-primary: #0F0F0F;
      --text-secondary: rgba(15, 15, 15, 0.7);
      --border-color: rgba(15, 15, 15, 0.12);
      --shadow-soft: 0 25px 60px rgba(15, 15, 15, 0.08);
      --nav-surface: rgba(255, 255, 255, 0.8);
      --pill-bg: rgba(15, 15, 15, 0.05);
      --glow-primary: 0 25px 65px rgba(30, 144, 255, 0.3);
      --section-bg: rgba(15, 15, 15, 0.04);
    }

    [data-theme="dark"] {
      --color-bg: #0F0F0F;
      --surface-primary: #161616;
      --surface-muted: #1F1F1F;
      --text-primary: #E0E0E0;
      --text-secondary: rgba(224, 224, 224, 0.75);
      --border-color: rgba(224, 224, 224, 0.08);
      --shadow-soft: 0 30px 70px rgba(0, 0, 0, 0.6);
      --nav-surface: rgba(15, 15, 15, 0.9);
      --pill-bg: rgba(224, 224, 224, 0.1);
      --glow-primary: 0 30px 80px rgba(30, 144, 255, 0.45);
      --section-bg: rgba(255, 255, 255, 0.02);
    }

    [data-theme="light"] {
      --color-bg: #F4F7FB;
      --surface-primary: #FFFFFF;
      --surface-muted: #EEF2F6;
      --text-primary: #0F0F0F;
      --text-secondary: rgba(15, 15, 15, 0.65);
      --border-color: rgba(15, 15, 15, 0.12);
      --shadow-soft: 0 25px 60px rgba(15, 15, 15, 0.08);
      --nav-surface: rgba(255, 255, 255, 0.85);
      --pill-bg: rgba(15, 15, 15, 0.05);
      --glow-primary: 0 25px 65px rgba(30, 144, 255, 0.25);
      --section-bg: rgba(15, 15, 15, 0.04);
    }

    * {
      transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
    }

    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: var(--color-bg);
      color: var(--text-primary);
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }

    ::selection {
      background: var(--accent-primary);
      color: #fff;
    }

    .glass-panel {
      background: var(--surface-primary);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-soft);
      backdrop-filter: blur(22px);
    }

    .surface-card {
      background: var(--surface-primary);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-soft);
    }

    .surface-muted {
      background: var(--surface-muted);
      border: 1px solid var(--border-color);
    }

    .pill {
      background: var(--pill-bg);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .neon-text {
      text-shadow: 0 0 20px rgba(30, 144, 255, 0.45), 0 0 45px rgba(63, 224, 197, 0.4);
    }

    .hero-mesh {
      background: radial-gradient(circle at 50% 20%, rgba(30, 144, 255, 0.25), transparent 60%),
                  radial-gradient(circle at 20% 80%, rgba(63, 224, 197, 0.2), transparent 55%);
      animation: pulse-glow 10s infinite ease-in-out;
    }

    @keyframes pulse-glow {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.15); opacity: 1; }
    }

    .float { animation: float 6s ease-in-out infinite; }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }

    .gradient-border {
      position: relative;
      border-radius: 1rem;
      background: var(--surface-primary);
    }
    .gradient-border::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 1.2rem;
      background: linear-gradient(120deg, var(--accent-primary), var(--accent-secondary));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s;
      filter: blur(4px);
    }
    .gradient-border:hover::before {
      opacity: 1;
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.55rem 1rem;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--surface-muted);
      color: var(--text-primary);
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .theme-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(15, 15, 15, 0.12);
    }

    .icon-bubble {
      background: linear-gradient(135deg, rgba(30, 144, 255, 0.12), rgba(63, 224, 197, 0.12));
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 0 20px rgba(30, 144, 255, 0.15);
    }

    .input-field {
      background: var(--surface-muted);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .input-field:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.15);
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* Professional Video Frame Animations */
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.3; filter: blur(40px); }
      50% { opacity: 0.6; filter: blur(60px); }
    }

    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }

    .animate-scan {
      animation: scan 3s linear infinite;
    }

    .animate-glow {
      animation: glow-pulse 4s ease-in-out infinite;
    }
  `}</style>
);

export default GlobalStyles;
