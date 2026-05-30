import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Layout, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const icons = { custom: Layout, ai: Zap, templates: Globe, seo: TrendingUp };

const Services = () => {
  const { t } = useLanguage();

  const servicesListLocal = [
    { id: 'custom', title: t('services.customTitle'), benefit: t('services.customDesc') },
    { id: 'ai', title: t('services.aiTitle'), benefit: t('services.aiDesc') },
    { id: 'templates', title: t('services.templatesTitle'), benefit: t('services.templatesDesc') },
    { id: 'seo', title: t('services.seoTitle'), benefit: t('services.seoDesc') },
  ];

  return (
    <section id="services" className="py-24 md:py-32 transition-colors duration-500" style={{ backgroundColor: 'var(--section-bg)' }}>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">{t('services.title')}</h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">{t('services.desc')}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {servicesListLocal.map((service, i) => {
            const Icon = icons[service.id] || Zap;
            return (
              <motion.div
                key={service.id}
                className="glass-panel p-8 rounded-2xl transition-all hover:shadow-[0_25px_60px_rgba(30,144,255,0.15)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-[var(--accent-primary)] bg-[var(--surface-muted)]">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{service.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{service.benefit}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
