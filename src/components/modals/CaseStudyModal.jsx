import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CaseStudyModal = ({ study, onClose }) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (!study) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [study, onClose]);

  if (!study) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="surface-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b surface-muted flex justify-between items-start" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
              study.tagColor === 'accent-secondary' ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-primary)]'
            }`}>
              {study.tag}
            </span>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-2">{study.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{study.industry}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--surface-primary)] text-[var(--text-secondary)]" aria-label={t('modal.close')}>
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] mb-1">{t('caseStudies.challenge')}</h4>
            <p className="text-[var(--text-primary)]">{study.challenge}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase text-[var(--text-secondary)] mb-1">{t('caseStudies.solution')}</h4>
            <p className="text-[var(--text-primary)]">{study.solution}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {study.metrics.map((m, i) => (
              <div key={i} className="surface-muted p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-[var(--accent-primary)]">{m.value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{m.label}</div>
              </div>
            ))}
          </div>
          {study.quote && (
            <blockquote className="border-l-4 pl-4 py-2" style={{ borderColor: 'var(--accent-primary)' }}>
              <p className="text-[var(--text-primary)] italic">&ldquo;{study.quote}&rdquo;</p>
              <cite className="text-sm text-[var(--text-secondary)] not-italic">— {study.quoteAuthor}</cite>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseStudyModal;
