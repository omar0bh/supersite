// src/components/Layout/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Bot, Menu, Moon, Sun } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = ({ onNavigate, theme = 'dark', onToggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav.about'), id: 'about' },
    { name: t('nav.services'), id: 'services' },
    { name: t('nav.portfolio'), id: 'portfolio' },
    { name: t('nav.demos'), id: 'demos' },
    { name: t('nav.aiTools'), id: 'ai-tools' },
    { name: t('nav.pricing'), id: 'pricing' },
  ];

  useEffect(() => {
     const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-40 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl shadow-xl py-4' : 'py-6'}`}
      style={{
        backgroundColor: scrolled ? 'var(--nav-surface)' : 'transparent',
        borderBottom: scrolled ? `1px solid var(--border-color)` : '1px solid transparent',
      }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
             <Bot size={24} />
             </div>
           <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Super<span className="text-[var(--accent-primary)]">Site</span></span>
         </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-[var(--text-secondary)]">
         {/* --- START FIX: Use navItems map with correct item.id --- */}
          {navItems.map((item) => (
           <button 
             key={item.id} 
             onClick={() => handleNav(item.id)} 
             className="hover:text-[var(--text-primary)] hover:scale-105 transition-all"
              >
            {item.name}
             </button>
           ))}
           {/* --- END FIX --- */}
            {/* Bilingual Language Switcher Toggle */}
            <div className="flex items-center gap-1 border border-[var(--border-color)] bg-[var(--surface-muted)] rounded-lg p-0.5 text-[10px] font-bold shadow-inner mr-2">
              <button 
                onClick={() => setLanguage('FR')} 
                className={`px-1.5 py-0.5 rounded transition-all ${language === 'FR' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLanguage('EN')} 
                className={`px-1.5 py-0.5 rounded transition-all ${language === 'EN' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                EN
              </button>
            </div>

            <button onClick={onToggleTheme} className="theme-toggle">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Button onClick={() => handleNav('contact')} variant="neon" className="py-2 px-6 text-sm rounded-lg">
            {t('nav.getQuote')}
            </Button>

          </div>

          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Bilingual Switcher */}
            <div className="flex items-center gap-1 border border-[var(--border-color)] bg-[var(--surface-muted)] rounded-lg p-0.5 text-[9px] font-bold shadow-inner">
              <button
                onClick={() => setLanguage('FR')}
                className={`px-1.5 py-0.5 rounded transition-all ${language === 'FR' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('EN')}
                className={`px-1.5 py-0.5 rounded transition-all ${language === 'EN' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}
              >
                EN
              </button>
            </div>
           <button onClick={onToggleTheme} className="theme-toggle px-3 py-2">
           {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
           </button>
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[var(--text-primary)]"><Menu /></button>
        </div>
     </div>

     {/* Mobile Navigation */}
       {isMenuOpen && (
       <div className="absolute top-full left-0 w-full border-b p-6 flex flex-col gap-4 md:hidden bg-[var(--surface-primary)]" style={{ borderColor: 'var(--border-color)' }}>
             {/* --- START FIX: Use navItems map with correct item.id --- */}
             {navItems.map((item) => (
             <button 
             key={item.id} 
             onClick={() => handleNav(item.id)} 
             className="text-left text-lg font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
             >
             {item.name}
           </button>
           ))}
           {/* --- END FIX --- */}
           <Button onClick={() => handleNav('contact')} variant="primary" className="w-full text-center">
           {t('nav.getQuote')}
         </Button>
      </div>
     )}
   </nav>
  );
};

export default Navbar;