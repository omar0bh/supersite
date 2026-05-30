import React, { useEffect, useState, Suspense, lazy } from 'react';
import GlobalStyles from './components/ui/GlobalStyles';
import SocialProofToast from './components/ui/SocialProofToast';
import Navbar from './components/Layout/Navbar';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import TechnologyStack from './components/sections/TechnologyStack';
import Contact from './components/sections/Contact';
import TemplateModal from './components/modals/TemplateModal';
import Footer from './components/Layout/Footer';
import MobileCTA from './components/ui/MobileCTA';
import { CONTACT } from './config/constants';
import { LanguageProvider } from './context/LanguageContext';

const TemplateStore = lazy(() => import('./components/sections/TemplateStore'));
const CaseStudies = lazy(() => import('./components/sections/CaseStudies'));
const AITools = lazy(() => import('./components/sections/AITools'));
const PricingCalculator = lazy(() => import('./components/sections/PricingCalculator'));
const Testimonials = lazy(() => import('./components/sections/Testimonials'));
const Resources = lazy(() => import('./components/sections/Resources'));

const AppContent = () => {
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

  const handleRequestDemo = (template) => {
    try {
      localStorage.setItem(
        'contactPrefill',
        `I'm interested in the ${template.name} template. Please contact me for a custom demo.`
      );
    } catch (_) {}
    setSelectedTemplate(null);
    scrollToSection('contact');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="min-h-screen antialiased bg-[var(--color-bg)] text-[var(--text-primary)] transition-colors duration-500 pb-20 md:pb-0">
      <GlobalStyles />
      <SocialProofToast />

      <a
        href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-8 right-8 z-50 bg-[var(--accent-secondary)] text-[var(--primary)] p-4 rounded-full shadow-[0_20px_45px_rgba(63,224,197,0.35)] hover:scale-110 transition-all duration-300 flex items-center gap-2 group border border-[var(--border-color)]"
      >
        <svg className="animate-bounce" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M21 7L9 19l-5-5" /></svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold">WhatsApp Us</span>
      </a>

      <Navbar onNavigate={scrollToSection} theme={theme} onToggleTheme={toggleTheme} />
      <Hero onNavigate={scrollToSection} theme={theme} />
      <Services />
      <About />
      <TechnologyStack />
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" /></div>}>
        <TemplateStore onSelectTemplate={setSelectedTemplate} />
        <CaseStudies />
        <AITools />
        <PricingCalculator onContact={() => scrollToSection('contact')} />
        <Testimonials />
        <Resources />
      </Suspense>
      <Contact />
      <Footer onNavigate={scrollToSection} />
      <MobileCTA onGetQuote={() => scrollToSection('contact')} />

      <TemplateModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onRequestDemo={handleRequestDemo} />
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
