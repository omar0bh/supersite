import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row items-center gap-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border-color)] flex items-center justify-center">
              <User size={64} className="text-[var(--text-secondary)]" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--text-primary)]">{t('about.headline')}</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{t('about.bio')}</p>
              <p className="text-sm text-[var(--accent-primary)] font-medium italic">&ldquo;{t('about.methodology')}&rdquo;</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
