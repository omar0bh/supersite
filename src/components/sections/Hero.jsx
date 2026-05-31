import React from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { COMPANY, CONTACT } from '../../config/constants';
import { useLanguage } from '../../context/LanguageContext';

const Hero = ({ onNavigate, theme = 'dark' }) => {
  const { t } = useLanguage();
  const pillars = t('hero.pillars') || COMPANY.pillars;

  return (
    <section id="hero" className="relative flex items-center min-h-screen pt-24 pb-16 overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 hero-mesh -z-10 opacity-70"></div>
      <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-[120px] -z-10 animate-pulse" style={{ backgroundColor: 'rgba(30, 144, 255, 0.2)' }}></div>
      <div className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full blur-[140px] -z-10" style={{ backgroundColor: 'rgba(63, 224, 197, 0.2)' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          <motion.div
            className="lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full pill text-[10px] font-bold uppercase tracking-widest mb-6 text-[var(--accent-primary)]">
              <Sparkles size={10} className="animate-pulse" /> {t('hero.badge')}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)]">
              {t('hero.titleLine1')} <br /> {t('hero.titleLine2')} <span className="neon-text text-[var(--accent-primary)]">{t('hero.titleFuture')}</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              {t('hero.desc2')}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center mb-6">
              <Button onClick={() => onNavigate('pricing')} variant="primary" icon={Sparkles} className="px-8 py-3.5 shadow-lg shadow-blue-500/20">{t('hero.ctaEstimate')}</Button>
              <Button onClick={() => onNavigate('demos')} variant="outline" icon={Eye} className="px-8 py-3.5">{t('hero.ctaPortfolio')}</Button>
            </div>

            <div className="mt-6 text-sm text-[var(--text-secondary)] flex justify-center lg:justify-start gap-1.5">
              <span>{t('hero.emailConsultation')}</span>
              <a href={`mailto:${CONTACT.email}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-all border-b border-[var(--border-color)] hover:border-[var(--accent-primary)] pb-0.5">
                {CONTACT.email}
              </a>
            </div>
          </motion.div>

          {/* Right Side: theme image – one aspect, no empty corners, same in both themes */}
          <motion.div
            className="lg:w-1/2 w-full flex items-center justify-start"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-image-wrap float relative w-full max-w-[600px] sm:max-w-[640px] aspect-[4/3] flex items-center justify-center overflow-hidden">
              <motion.img
                src={`${process.env.PUBLIC_URL}/white.png`}
                alt="SuperSite – web agency"
                className="absolute inset-0 w-full h-full object-cover object-center"
                animate={{ opacity: theme === 'light' ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ pointerEvents: 'none' }}
              />
              <motion.img
                src={`${process.env.PUBLIC_URL}/dark.png`}
                alt="SuperSite – web agency"
                className="absolute inset-0 w-full h-full object-cover object-center"
                animate={{ opacity: theme === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Real metrics bar */}
        <motion.div
          className="mt-16 pt-12 border-t flex flex-wrap justify-center gap-8 md:gap-12"
          style={{ borderColor: 'var(--border-color)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--accent-primary)]">{COMPANY.stats.projects}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{t('hero.statsProjects')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--accent-secondary)]">{COMPANY.stats.satisfaction}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{t('hero.statsSatisfaction')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{COMPANY.stats.years}</div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{t('hero.statsYears')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
