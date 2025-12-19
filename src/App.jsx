import React, { useEffect, useState } from 'react';
import GlobalStyles from './components/ui/GlobalStyles';
import SocialProofToast from './components/ui/SocialProofToast';
import Navbar from './components/Layout/Navbar';
import Hero from './components/sections/Hero';
import TemplateStore from './components/sections/TemplateStore';
import CaseStudies from './components/sections/CaseStudies';
import AITools from './components/sections/AITools';
import PricingCalculator from './components/sections/PricingCalculator';
import Contact from './components/sections/Contact';
import TemplateModal from './components/modals/TemplateModal';

const App = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('devsite-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devsite-theme', theme);
  }, [theme]);

  const scrollToSection = (id) => {
    window.location.hash = '';
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen antialiased bg-[var(--color-bg)] text-[var(--text-primary)] transition-colors duration-500">
      <GlobalStyles />
      <SocialProofToast />

      <a
        href="https://wa.me/+212761551686"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[var(--accent-secondary)] text-[var(--primary)] p-4 rounded-full shadow-[0_20px_45px_rgba(63,224,197,0.35)] hover:scale-110 transition-all duration-300 flex items-center gap-2 group border border-[var(--border-color)]"
      >
        <svg className="animate-bounce" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M21 7L9 19l-5-5" /></svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold">WhatsApp Us</span>
      </a>

      <Navbar onNavigate={scrollToSection} theme={theme} onToggleTheme={toggleTheme} />
      <Hero onNavigate={scrollToSection} />
      <TemplateStore onSelectTemplate={setSelectedTemplate} />
      <CaseStudies />
      <AITools />
      <PricingCalculator onContact={() => scrollToSection('contact')} />
      <Contact />

      <TemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
    </div>
  );
};

export default App;
