import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { CONTACT } from '../../config/constants';
import { useLanguage } from '../../context/LanguageContext';

const footerServices = [
  { nameKey: 'nav.about', id: 'about' },
  { nameKey: 'nav.services', id: 'services' },
  { nameKey: 'nav.portfolio', id: 'portfolio' },
  { nameKey: 'nav.demos', id: 'demos' },
  { nameKey: 'nav.aiTools', id: 'aiTools' },
  { nameKey: 'nav.pricing', id: 'pricing' },
  { nameKey: 'contact.title', id: 'contact' },
];

const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterStatus('success');
    setEmail('');
  };

  return (
    <footer className="border-t bg-[var(--surface-primary)] transition-colors duration-500" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Super<span className="text-[var(--accent-primary)]">Site</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4">{t('footer.serving')}</p>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <MapPin size={14} /> {CONTACT.address}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('nav.services')}</h4>
            <ul className="space-y-2">
              {footerServices.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {t(item.nameKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors">
                  <Phone size={16} /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors">
                  <Mail size={16} /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--accent-primary)] transition-colors">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('footer.newsletterTitle')}</h4>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPlaceholder')}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none input-field"
                aria-label="Newsletter email"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
              >
                {t('footer.subscribeBtn')}
              </button>
              {newsletterStatus === 'success' && (
                <p className="text-xs text-[var(--accent-secondary)]">{t('footer.successMsg')}</p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} SuperSite. {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-xs">
            <a href="#privacy" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">{t('footer.privacy')}</a>
            <a href="#terms" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
