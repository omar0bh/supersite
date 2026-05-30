import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Resources = () => {
  const { t } = useLanguage();

  const resourcesList = [
    { id: 1, title: t('resources.items.item1Title'), desc: t('resources.items.item1Desc'), href: '#portfolio' },
    { id: 2, title: t('resources.items.item2Title'), desc: t('resources.items.item2Desc'), href: '#portfolio' },
    { id: 3, title: t('resources.items.item3Title'), desc: t('resources.items.item3Desc'), href: '#portfolio' },
  ];

  return (
    <section id="resources" className="py-24 md:py-32 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">{t('resources.title')}</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t('resources.desc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {resourcesList.map((item, i) => (
            <motion.a
              key={item.id}
              href={item.href}
              className="glass-panel p-6 rounded-2xl block transition-all hover:shadow-[0_25px_60px_rgba(30,144,255,0.12)] hover:-translate-y-1 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <FileText size={28} className="text-[var(--accent-primary)] mb-3" />
              <h3 className="font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{item.desc}</p>
              <span className="text-sm font-medium text-[var(--accent-primary)] inline-flex items-center gap-1">
                {t('resources.readMore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Resources;
