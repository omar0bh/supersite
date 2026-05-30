import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { CONTACT } from '../../config/constants';
import { useLanguage } from '../../context/LanguageContext';

const MobileCTA = ({ onGetQuote }) => {
  const { t, language } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-center gap-2 p-3 border-t bg-[var(--nav-surface)] backdrop-blur-xl" style={{ borderColor: 'var(--border-color)' }}>
      <button
        type="button"
        onClick={onGetQuote}
        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[var(--accent-primary)] text-white shadow-lg"
      >
        {t('nav.getQuote')}
      </button>
      <a
        href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border-color)]"
        aria-label={language === 'FR' ? 'Appeler' : 'Call us'}
      >
        <Phone size={18} /> {language === 'FR' ? 'Appeler' : 'Call'}
      </a>
      <a
        href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[var(--accent-secondary)] text-[var(--primary)] border border-[var(--border-color)]"
        aria-label="WhatsApp"
      >
        <MessageCircle size={18} /> WhatsApp
      </a>
    </div>
  );
};

export default MobileCTA;
