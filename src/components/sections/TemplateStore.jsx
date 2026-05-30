import React, { useMemo, useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { templates as staticTemplates } from '../../config/data';
import { API_ENDPOINTS } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

const ALL_CATEGORIES = 'All';

const TemplateStore = ({ onSelectTemplate }) => {
  const { t, language } = useLanguage();
  const [filterCat, setFilterCat] = useState(ALL_CATEGORIES);
  const [hasLiveOnly, setHasLiveOnly] = useState(false);
  const [dynamicTemplates, setDynamicTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GET_TEMPLATES);
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            // Map the icons back!
            const mapped = result.data.map(item => {
              const staticMatch = staticTemplates.find(t => t.name.toLowerCase() === item.name.toLowerCase());
              return {
                ...item,
                icon: staticMatch ? staticMatch.icon : Eye
              };
            });
            setDynamicTemplates(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic templates, falling back to static structures:', err);
      }
      setDynamicTemplates(staticTemplates);
      setLoading(false);
    };
    loadTemplates();
  }, []);

  const templatesList = dynamicTemplates.length > 0 ? dynamicTemplates : staticTemplates;

  const categories = useMemo(() => {
    return [ALL_CATEGORIES, ...new Set(templatesList.map((t) => t.cat))];
  }, [templatesList]);

  const filtered = useMemo(() => {
    return templatesList.filter((temp) => {
      const matchCat = filterCat === ALL_CATEGORIES || temp.cat === filterCat;
      const matchLive = !hasLiveOnly || (temp.subDemos && temp.subDemos.length > 0);
      return matchCat && matchLive;
    });
  }, [filterCat, hasLiveOnly, templatesList]);

  return (
    <section id="demos" className="py-32 relative bg-[var(--section-bg)] transition-colors duration-500">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">{t('templates.title')} <span className="text-[var(--accent-primary)]">{t('templates.highlight')}</span></h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">{t('templates.desc')}</p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 mb-10">
          <span className="text-sm font-medium text-[var(--text-secondary)]">{t('templates.filter')}</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterCat === cat
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--surface-primary)]'
                }`}
              >
                {cat === ALL_CATEGORIES ? t('templates.all') : (t(`templates.${cat}`) || cat)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={hasLiveOnly}
              onChange={(e) => setHasLiveOnly(e.target.checked)}
              className="rounded border-[var(--border-color)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">{t('templates.hasLiveOnly')}</span>
          </label>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {filtered.map((temp) => {
            const hasLiveDemo = temp.subDemos && temp.subDemos.length > 0;
            
            // Get translation for description if available
            const descKey = `templates.${temp.name.toLowerCase()}Desc`;
            const displayDesc = t(descKey) !== descKey ? t(descKey) : temp.desc;
            const displayCat = t(`templates.${temp.cat}`) || temp.cat;

            return (
              <div key={temp.id} className="group relative cursor-pointer" onClick={() => onSelectTemplate(temp)}>
                <div className="surface-card rounded-2xl overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-[var(--surface-muted)]/10">
                  {/* Top Image Box */}
                  <div className="relative h-48 overflow-hidden bg-[var(--surface-muted)] border-b border-[var(--border-color)]">
                    {hasLiveDemo && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-green-500/90 text-white border border-green-400/20 shadow-sm">
                        {t('templates.liveBadge')}
                      </span>
                    )}
                    {temp.image ? (
                      <>
                        <img
                          src={process.env.PUBLIC_URL + temp.image}
                          alt={temp.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      </>
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${temp.color} opacity-30 group-hover:opacity-50 transition-opacity`} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <button type="button" className="bg-[var(--accent-primary)] text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-[var(--glow-primary)]/40 text-xs">
                        <Eye size={14} /> {t('templates.preview')}
                      </button>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg text-[10px] font-extrabold text-[var(--text-primary)] border border-[var(--border-color)]">
                        {displayCat}
                      </span>
                    </div>
                  </div>

                  {/* Details Block */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mb-1.5">{temp.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{displayDesc}</p>
                      
                      {/* Tech tags */}
                      {temp.tech && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {temp.tech.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-[var(--color-bg)] text-[var(--text-secondary)] px-2 py-0.5 rounded font-bold border border-[var(--border-color)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sitepro Data Metrics Row */}
                    <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] mt-2">
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{t('templates.visitors')}</p>
                        <p className="font-extrabold text-sm text-[var(--accent-primary)]">{temp.visitors || '8K+'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">{t('templates.conversion')}</p>
                        <p className="font-extrabold text-sm text-green-500">{temp.conversion || '4.5%'}</p>
                      </div>
                      <div className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors">
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TemplateStore;
