// src/components/ui/SocialProofToast.jsx
import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SocialProofToast = () => {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ text: "", time: "" });

  const messagesEN = [
    { text: "Someone from Casablanca requested a quote", time: "Just now" },
    { text: "Real Estate template demo viewed", time: "2 mins ago" },
    { text: "New project launched in Marrakech", time: "1 hour ago" },
    { text: "E-commerce AI audit completed", time: "5 mins ago" },
    { text: "Consultation booked — FinTech (via website)", time: "10 mins ago" },
    { text: "Property listing published in Rabat", time: "22 mins ago" },
    { text: "Checkout completed — Restaurant order", time: "35 mins ago" },
    { text: "Brand kit downloaded", time: "47 mins ago" },
    { text: "Design brief received — Agency", time: "1 hour ago" },
    { text: "Newsletter subscribed (via Instagram)", time: "2 hours ago" },
    { text: "Prototype shared with client", time: "3 hours ago" },
    { text: "Payment confirmed — SaaS annual plan", time: "4 hours ago" },
    { text: "Landing page live — Portfolio site", time: "6 hours ago" },
    { text: "Contact form submitted — Support request", time: "7 hours ago" },
    { text: "New lead from Tanger (via Google)", time: "Yesterday" },
    { text: "Agency template demo viewed", time: "1 day ago" },
    { text: "Real Estate listing updated in Agadir", time: "2 days ago" },
    { text: "Design sprint started — Education sector", time: "3 days ago" },
    { text: "Consultation booked — Health", time: "3 days ago" },
    { text: "4 templates downloaded — E-commerce", time: "5 days ago" },
    { text: "Referral signup — Fès", time: "6 days ago" },
    { text: "New campaign launched (via Facebook ad)", time: "Nov 15" },
    { text: "UX audit scheduled — FinTech client", time: "Nov 12" },
    { text: "Real Estate template purchased", time: "Nov 10" },
    { text: "Prototype feedback received (via Email)", time: "Nov 8" },
    { text: "Design assets exported — Meknès", time: "Nov 6" },
    { text: "SaaS onboarding completed", time: "Nov 3" },
    { text: "Consultation booked — Mohammedia", time: "Nov 1" },
    { text: "Marketplace listing approved", time: "Oct 28" }
  ];

  const messagesFR = [
    { text: "Quelqu'un de Casablanca a demandé un devis", time: "À l'instant" },
    { text: "Démo du modèle Immobilier consultée", time: "Il y a 2 min" },
    { text: "Nouveau projet lancé à Marrakech", time: "Il y a 1 heure" },
    { text: "Audit IA E-commerce complété", time: "Il y a 5 min" },
    { text: "Consultation réservée — FinTech (via site web)", time: "Il y a 10 min" },
    { text: "Annonce immobilière publiée à Rabat", time: "Il y a 22 min" },
    { text: "Commande finalisée — Menu Restaurant", time: "Il y a 35 min" },
    { text: "Kit de marque téléchargé", time: "Il y a 47 min" },
    { text: "Cahier des charges reçu — Agence", time: "Il y a 1 heure" },
    { text: "Inscription newsletter (via Instagram)", time: "Il y a 2 heures" },
    { text: "Prototype partagé avec le client", time: "Il y a 3 heures" },
    { text: "Paiement confirmé — Plan annuel SaaS", time: "Il y a 4 heures" },
    { text: "Landing page en ligne — Site Portfolio", time: "Il y a 6 heures" },
    { text: "Formulaire de contact soumis — Support", time: "Il y a 7 heures" },
    { text: "Nouveau lead de Tanger (via Google)", time: "Hier" },
    { text: "Démo du modèle Agence consultée", time: "Il y a 1 jour" },
    { text: "Annonce Immobilière mise à jour à Agadir", time: "Il y a 2 jours" },
    { text: "Sprint de design démarré — Secteur Éducation", time: "Il y a 3 jours" },
    { text: "Consultation réservée — Santé", time: "Il y a 3 jours" },
    { text: "4 modèles téléchargés — E-commerce", time: "Il y a 5 jours" },
    { text: "Inscription par parrainage — Fès", time: "Il y a 6 jours" },
    { text: "Nouvelle campagne lancée (via Facebook Ads)", time: "15 Nov" },
    { text: "Audit UX planifié — Client FinTech", time: "12 Nov" },
    { text: "Modèle Immobilier acheté", time: "10 Nov" },
    { text: "Retour sur prototype reçu (via Email)", time: "8 Nov" },
    { text: "Ressources de design exportées — Meknès", time: "6 Nov" },
    { text: "Intégration SaaS terminée", time: "3 Nov" },
    { text: "Consultation réservée — Mohammedia", time: "1 Nov" },
    { text: "Fiche Marketplace approuvée", time: "28 Oct" }
  ];

  const messages = language === 'FR' ? messagesFR : messagesEN;

  useEffect(() => {
    // Initial message
    const initialMsg = messages[Math.floor(Math.random() * messages.length)];
    setMsg(initialMsg);

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setMsg(randomMsg);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div className={`fixed bottom-24 left-6 z-50 transition-all duration-500 transform ${visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
      <div className="glass-panel p-4 rounded-xl flex items-center gap-4 shadow-2xl border-l-4 max-w-sm" style={{ borderColor: 'var(--accent-primary)' }}>
        <div className="icon-bubble p-2 rounded-full text-[var(--accent-primary)] animate-pulse">
          <Zap size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">{msg.text}</p>
          <p className="text-xs text-[var(--text-secondary)]">{msg.time}</p>
        </div>
      </div>
    </div>
  );
};

export default SocialProofToast;
