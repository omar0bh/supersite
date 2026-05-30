import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials as staticTestimonials } from '../../config/testimonialsData';
import { API_ENDPOINTS } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

const Testimonials = () => {
  const { t, language } = useLanguage();
  const [index, setIndex] = useState(0);
  const [featuredFromBackend, setFeaturedFromBackend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ENDPOINTS.FEATURED_FEEDBACK)
      .then((res) => res.ok ? res.json() : { success: false, data: [] })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setFeaturedFromBackend(json.data.map((f) => ({
            id: `fb-${f.id}`,
            quote: f.feedback || '',
            author: f.name || 'Client',
            role: `Client · ${f.rating || 5}/5`,
            avatar: null,
          })));
        }
      })
      .catch(() => setFeaturedFromBackend([]))
      .finally(() => setLoading(false));
  }, []);

  const translatedStaticTestimonials = staticTestimonials.map((item) => ({
    ...item,
    quote: t(`testimonials.static${item.id}.quote`) || item.quote,
    author: t(`testimonials.static${item.id}.author`) || item.author,
    role: t(`testimonials.static${item.id}.role`) || item.role,
  }));

  const testimonials = [...featuredFromBackend, ...translatedStaticTestimonials];
  const current = testimonials[index];

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 md:py-32 transition-colors duration-500" style={{ backgroundColor: 'var(--section-bg)' }}>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-primary)]">{t('testimonials.title')}</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t('testimonials.desc')}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            className="glass-panel p-8 md:p-12 rounded-3xl relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Quote size={32} className="text-[var(--accent-primary)] opacity-50 mb-4" />
            {loading ? (
              <p className="text-[var(--text-secondary)]">{language === 'FR' ? 'Chargement des témoignages...' : 'Loading testimonials…'}</p>
            ) : testimonials.length === 0 ? (
              <p className="text-[var(--text-secondary)]">{language === 'FR' ? 'Aucun témoignage disponible pour le moment.' : 'No testimonials to show yet.'}</p>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-xl md:text-2xl text-[var(--text-primary)] leading-relaxed mb-8">&ldquo;{current.quote}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-secondary)]">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{current.author}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{current.role}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center gap-4 mt-8">
                  <button type="button" onClick={prev} className="p-2 rounded-full border border-[var(--border-color)] hover:bg-[var(--surface-muted)] transition-colors" aria-label="Previous">
                    <ChevronLeft size={24} className="text-[var(--text-secondary)]" />
                  </button>
                  <button type="button" onClick={next} className="p-2 rounded-full border border-[var(--border-color)] hover:bg-[var(--surface-muted)] transition-colors" aria-label="Next">
                    <ChevronRight size={24} className="text-[var(--text-secondary)]" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
