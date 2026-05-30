import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Mail, CheckCircle, XCircle, MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import { API_ENDPOINTS } from '../../config/api';
import { CONTACT } from '../../config/constants';
import { useLanguage } from '../../context/LanguageContext';

const Contact = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [pricingData, setPricingData] = useState(null);

  // Feedback states
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [feedbackErrorMessage, setFeedbackErrorMessage] = useState('');
  const [contactErrorMessage, setContactErrorMessage] = useState('');
  const [preferredContact, setPreferredContact] = useState('whatsapp');
  const [email, setEmail] = useState('');

  const lastSyncedSignature = useRef('');

  const loadPricingData = useCallback(() => {
    try {
      const prefill = localStorage.getItem('contactPrefill');
      if (prefill) {
        setDescription(prefill);
        localStorage.removeItem('contactPrefill');
      }

      const savedOptions = localStorage.getItem('selectedOptions');
      const savedPrice = localStorage.getItem('finalPrice');
      const currentSignature = (savedOptions || '') + '-' + (savedPrice || '');

      if (!savedOptions || !savedPrice) {
        setPricingData(null);
        return;
      }
      if (currentSignature === lastSyncedSignature.current) return;
      lastSyncedSignature.current = currentSignature;

      const selectedOptions = JSON.parse(savedOptions);
      const finalPrice = parseInt(savedPrice, 10);

      setPricingData({ features: selectedOptions, total: finalPrice });
    } catch {
      setPricingData(null);
    }
  }, []);

  useEffect(() => {
    loadPricingData();
    const section = document.getElementById('contact');
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadPricingData();
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [loadPricingData]);

  const removeFeatureFromQuote = (indexToRemove) => {
    if (!pricingData?.features?.length) return;
    const newFeatures = pricingData.features.filter((_, i) => i !== indexToRemove);
    const newTotal = 2000 + newFeatures.reduce((sum, f) => sum + (f.price || 0), 0);
    setPricingData({ features: newFeatures, total: newTotal });
    try {
      localStorage.setItem('selectedOptions', JSON.stringify(newFeatures));
      localStorage.setItem('finalPrice', String(newTotal));
    } catch (_) {}
  };

  const cancelWholeQuote = () => {
    setPricingData(null);
    setDescription('');
    try {
      localStorage.removeItem('selectedOptions');
      localStorage.removeItem('finalPrice');
      lastSyncedSignature.current = '';
    } catch (_) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !description.trim()) {
      const fieldError = language === 'FR'
        ? 'Veuillez remplir tous les champs obligatoires.'
        : 'Please fill out all required fields.';
      setContactErrorMessage(fieldError);
      setSubmitStatus('error');
      return;
    }

    if (description.trim().length < 10) {
      const lengthError = language === 'FR'
        ? 'La description doit faire au moins 10 caractères.'
        : 'Description must be at least 10 characters.';
      setContactErrorMessage(lengthError);
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setContactErrorMessage('');

    try {
      const contactData = {
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim(),
        preferredContact,
        email: preferredContact === 'email' ? email.trim() : undefined,
        timestamp: new Date().toISOString(),
        selectedFeatures: pricingData ? pricingData.features : [],
        totalPrice: pricingData ? pricingData.total : 2000,
        estimatedDelivery: pricingData?.total > 4000 ? '7-10 Days' : '5-7 Days'
      };

      const response = await fetch(API_ENDPOINTS.SAVE_OFFER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response && response.ok) {
        setName('');
        setPhone('');
        setDescription('');
        setEmail('');
        setPricingData(null);
        setSubmitStatus('success');
        try {
          localStorage.removeItem('selectedOptions');
          localStorage.removeItem('finalPrice');
        } catch (_) {}
      } else {
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.message || (language === 'FR' ? 'La validation a échoué. Veuillez vérifier vos données.' : 'Validation failed. Please check your inputs.');
        setContactErrorMessage(serverError);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      let errorMessage = language === 'FR' ? "Échec de l'envoi de la demande." : 'Failed to submit contact request.';
      const errorString = String(error.message || error).toLowerCase();

      if (errorString.includes('failed to fetch') || errorString.includes('networkerror') || error.name === 'TypeError') {
        if (API_ENDPOINTS.SAVE_OFFER && API_ENDPOINTS.SAVE_OFFER.includes('herokuapp.com') && window.location.hostname === 'localhost') {
          errorMessage = 'CORS Error: Using Heroku URL from localhost. For local development, make sure your .env has REACT_APP_API_URL=http://localhost:3003 and restart the app.';
        } else if (API_ENDPOINTS.SAVE_OFFER && API_ENDPOINTS.SAVE_OFFER.includes('localhost')) {
          errorMessage = language === 'FR'
            ? 'Connexion au serveur impossible. Lancez le serveur : npm run server'
            : 'Cannot connect to server. Make sure the server is running: npm run server';
        } else {
          errorMessage = language === 'FR'
            ? 'Erreur réseau. Veuillez vérifier votre connexion ou réessayer plus tard.'
            : 'Network error. Please check your connection or try again later.';
        }
      }

      setContactErrorMessage(errorMessage);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackName.trim() || !feedbackText.trim() || feedbackRating === 0) {
      const feedbackError = language === 'FR'
        ? 'Veuillez remplir tous les champs et sélectionner une note.'
        : 'Please fill out all fields and select a rating.';
      setFeedbackErrorMessage(feedbackError);
      setFeedbackStatus('error');
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackStatus(null);

    try {
      const feedbackData = {
        name: feedbackName.trim(),
        feedback: feedbackText.trim(),
        rating: feedbackRating,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(API_ENDPOINTS.SAVE_FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response && response.ok) {
        setFeedbackName('');
        setFeedbackText('');
        setFeedbackRating(0);
        setFeedbackStatus('success');
        setTimeout(() => setFeedbackStatus(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.message || (language === 'FR' ? 'La validation a échoué.' : 'Validation failed.');
        setFeedbackErrorMessage(serverError);
        setFeedbackStatus('error');
        setTimeout(() => {
          setFeedbackStatus(null);
          setFeedbackErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      let errorMessage = language === 'FR' ? "Échec de la soumission de l'avis." : 'Failed to submit feedback.';
      const errorString = String(error.message || error).toLowerCase();

      if (errorString.includes('failed to fetch') || errorString.includes('networkerror') || error.name === 'TypeError') {
        if (API_ENDPOINTS.SAVE_FEEDBACK.includes('herokuapp.com') && window.location.hostname === 'localhost') {
          errorMessage = 'CORS Error: Using Heroku URL from localhost.';
        } else if (API_ENDPOINTS.SAVE_FEEDBACK.includes('localhost')) {
          errorMessage = language === 'FR'
            ? 'Impossible de se connecter au serveur backend.'
            : 'Cannot connect to server. Make sure the server is running.';
        } else {
          errorMessage = language === 'FR'
            ? 'Erreur réseau. Veuillez réessayer.'
            : 'Network error. Please try again later.';
        }
      }

      setFeedbackErrorMessage(errorMessage);
      setFeedbackStatus('error');
      setTimeout(() => {
        setFeedbackStatus(null);
        setFeedbackErrorMessage('');
      }, 6000);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="glass-panel rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row gap-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[var(--text-primary)]">
              {language === 'FR' ? (
                <>Bâtissons l&apos; <br /> <span className="text-[var(--accent-primary)]">Extraordinaire.</span></>
              ) : (
                <>Let&apos;s build the <br /> <span className="text-[var(--accent-primary)]">Extraordinary.</span></>
              )}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-6">
              {language === 'FR' ? "Prêt à dominer votre marché ? Envoyez-nous un message." : "Ready to dominate your market? Send us a message."}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {language === 'FR' ? "Nous répondons sous 24 heures. Vos données ne sont jamais partagées." : "We answer within 24 hours. Your data is never shared."}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-8">
              {language === 'FR' ? `Basé à ${CONTACT.address}` : `Based in ${CONTACT.address}`}
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-primary)]"><Phone /></div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">{language === 'FR' ? "Appelez-nous" : "Call Us"}</div>
                  <div className="font-bold text-[var(--text-primary)]">{CONTACT.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-secondary)]"><Mail /></div>
                <div>
                  <div className="text-sm text-[var(--text-secondary)]">{language === 'FR' ? "Envoyez un e-mail" : "Email Us"}</div>
                  <div className="font-bold text-[var(--text-primary)]">{CONTACT.email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {pricingData && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 shadow-lg mb-4">
                  <div className="flex justify-between items-center gap-3 mb-3">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      {language === 'FR'
                        ? `✨ Votre devis (${pricingData.total} DH) est prêt — ajoutez vos coordonnées.`
                        : `✨ Your quote (${pricingData.total} DH) is ready — just add your details.`}
                    </span>
                    <button
                      type="button"
                      onClick={cancelWholeQuote}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center gap-2 focus:outline-none"
                    >
                      <X size={16} strokeWidth={2.5} /> {language === 'FR' ? "Annuler" : "Cancel"}
                    </button>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mb-3">
                    {language === 'FR' ? "Formule de Base" : "Base Package"} (2000 DH){pricingData.features?.length ? ` + ${pricingData.features.length} ${language === 'FR' ? 'option(s)' : 'feature(s)'}` : ''}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pricingData.features?.map((f, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 pl-3 pr-1 py-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-600">
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                          {f.name} (+{f.price} DH)
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); removeFeatureFromQuote(idx); }}
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center focus:outline-none"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {language === 'FR' ? "Nom complet" : "Name"}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder={language === 'FR' ? "Votre nom" : "Your name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl px-6 py-4 outline-none input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {language === 'FR' ? "Téléphone (chiffres uniquement)" : "Phone (numbers only)"}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="212612345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl px-6 py-4 outline-none input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-preferred" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  {language === 'FR' ? "Méthode de contact préférée" : "Preferred contact method"}
                </label>
                <select
                  id="contact-preferred"
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value)}
                  className="w-full rounded-xl px-6 py-4 outline-none input-field"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">{language === 'FR' ? "Appel Téléphonique" : "Phone call"}</option>
                  <option value="email">Email</option>
                </select>
              </div>
              {preferredContact === 'email' && (
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    {language === 'FR' ? "Votre e-mail" : "Your email"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl px-6 py-4 outline-none input-field"
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="contact-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  {language === 'FR' ? "Description du projet (min. 10 caractères)" : "Project description (min. 10 characters)"}
                </label>
                <textarea
                  id="contact-description"
                  placeholder={language === 'FR' ? "Parlez-nous de votre vision... (au moins 10 caractères)" : "Tell us about your vision... (at least 10 characters)"}
                  rows="5"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl px-6 py-4 outline-none input-field resize-none"
                  required
                  minLength={10}
                />
                {description.length > 0 && description.length < 10 && (
                  <p className="text-xs text-amber-500 mt-1">
                    {10 - description.length} {language === 'FR' ? "caractère(s) manquant(s)" : `more character${10 - description.length !== 1 ? 's' : ''} needed`}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Button type="submit" variant="neon" className="w-full py-5 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? (language === 'FR' ? 'Enregistrement...' : 'Saving...') : (language === 'FR' ? 'Envoyer la Demande' : 'Send Request')}
                </Button>
                {submitStatus === 'success' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--accent-secondary)] text-sm">
                      <CheckCircle size={16} />
                      <span>{language === 'FR' ? "Merci — nous vous appellerons sous 24h." : "Thank you — we'll call you within 24h."}</span>
                    </div>
                    {CONTACT.calendarUrl && (
                      <a href={CONTACT.calendarUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[var(--accent-primary)] hover:underline">
                        {language === 'FR' ? "Ou réservez un appel maintenant →" : "Or book a call now →"}
                      </a>
                    )}
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <XCircle size={16} />
                    <span>{contactErrorMessage || (language === 'FR' ? "Échec de l'enregistrement." : 'Failed to save.')}</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          className="mt-12 glass-panel rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2 text-[var(--accent-primary)]">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {language === 'FR' ? "Partagez Votre Expérience" : "Share Your Experience"}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto">
              {language === 'FR' ? "Votre avis nous aide à nous améliorer !" : "Your feedback helps us improve!"}
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="max-w-xl mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder={language === 'FR' ? "Votre nom" : "Your name"}
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none input-field text-sm"
                required
              />
            </div>

            <div>
              <div className="mb-2">
                <StarRating
                  rating={feedbackRating}
                  onRatingChange={setFeedbackRating}
                  disabled={isSubmittingFeedback}
                />
              </div>
              {feedbackRating === 0 && (
                <p className="text-xs text-[var(--text-secondary)]">
                  {language === 'FR' ? "Veuillez sélectionner une note" : "Please select a rating"}
                </p>
              )}
            </div>

            <div>
              <textarea
                placeholder={language === 'FR' ? "Dites-nous ce que vous pensez..." : "Tell us what you think..."}
                rows="3"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full rounded-xl px-4 py-3 outline-none input-field resize-none text-sm"
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                variant="neon"
                className="w-full py-3 text-base"
                disabled={isSubmittingFeedback || feedbackRating === 0}
              >
                {isSubmittingFeedback ? (language === 'FR' ? 'Envoi...' : 'Submitting...') : (language === 'FR' ? "Soumettre l'Avis" : 'Submit Feedback')}
              </Button>

              {feedbackStatus === 'success' && (
                <div className="flex items-center gap-2 text-[var(--accent-secondary)] text-xs">
                  <CheckCircle size={14} />
                  <span>{language === 'FR' ? "Merci pour votre avis !" : "Thank you for your feedback!"}</span>
                </div>
              )}

              {feedbackStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <XCircle size={14} />
                  <span>
                    {feedbackRating === 0
                      ? (language === 'FR' ? 'Veuillez sélectionner une note avant de soumettre.' : 'Please select a rating before submitting.')
                      : feedbackErrorMessage || (language === 'FR' ? "Échec de la soumission de l'avis." : 'Failed to submit.')}
                  </span>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
