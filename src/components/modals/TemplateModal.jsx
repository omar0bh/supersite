import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

const TemplateModal = ({ template, onClose, onRequestDemo }) => {
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!template) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [template, onClose]);

  if (!template) return null;

  const Icon = template.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="surface-card w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[85vh] animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center surface-muted" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white shadow-lg`}>
              {Icon && typeof Icon === 'function' ? <Icon size={24} /> : null}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Collection {template.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {language === 'FR' ? "Sélectionnez une démo pour prévisualiser" : "Select a demo to preview"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface-primary)] rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--surface-primary)]">
          {template.subDemos && template.subDemos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {template.subDemos.map((demo) => (
                <a
                  key={demo.id}
                  href={demo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group relative rounded-2xl overflow-hidden surface-card border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="aspect-video bg-[var(--surface-muted)] relative overflow-hidden">
                    {demo.image ? (
                      <img src={process.env.PUBLIC_URL + demo.image} alt={demo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${template.color} opacity-20 flex items-center justify-center`}>
                        <span className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-bold">
                          {language === 'FR' ? "Aucun Aperçu" : "No Preview"}
                        </span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-bold border border-white/20">
                        {language === 'FR' ? "Voir la Démo" : "View Demo"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">{demo.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {language === 'FR' ? "Aperçu en Direct" : "Live Preview"}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 mb-6 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--text-secondary)]">
                {Icon ? <Icon size={40} /> : null}
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {language === 'FR' ? "Bientôt Disponible" : "Coming Soon"}
              </h3>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
                {language === 'FR'
                  ? "Nous mettons actuellement à jour les démos pour cette catégorie. Veuillez revenir plus tard ou nous contacter pour un aperçu privé."
                  : "We are currently updating the demos for this category. Please check back later or contact us for a private preview."}
              </p>
              {onRequestDemo && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onRequestDemo(template);
                    onClose();
                  }}
                >
                  {t('modal.demoCta')}
                </Button>
              )}
              {template.link && (
                <a href={template.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                  <Button variant="outline">{t('modal.liveCta')}</Button>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t surface-card flex justify-between items-center bg-[var(--surface-muted)]" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-xs text-[var(--text-secondary)]">
            {template.subDemos?.length
              ? (language === 'FR' ? `${template.subDemos.length} démo${template.subDemos.length !== 1 ? 's' : ''} disponible${template.subDemos.length !== 1 ? 's' : ''}` : `${template.subDemos.length} demo${template.subDemos.length !== 1 ? 's' : ''} available`)
              : (language === 'FR' ? "Aucune démo pour le moment - bientôt disponible" : "No demos yet — coming soon")}
          </div>
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-[var(--text-primary)] hover:bg-[var(--surface-primary)] transition-colors">
            {t('modal.close')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TemplateModal;
