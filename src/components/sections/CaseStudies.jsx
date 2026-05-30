import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseStudies } from '../../config/caseStudiesData';
import CaseStudyModal from '../modals/CaseStudyModal';
import { useLanguage } from '../../context/LanguageContext';

const CaseStudies = () => {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const { t, language } = useLanguage();

  const caseStudiesLocal = caseStudies.map(study => {
    if (language === 'FR') {
      let tag = study.tag;
      let industry = study.industry;
      let challenge = study.challenge;
      let solution = study.solution;
      let metrics = study.metrics.map(m => {
        let label = m.label;
        if (m.label === 'Bookings') label = 'Réservations';
        else if (m.label === 'Load Time') label = 'Temps de chargement';
        else if (m.label === 'Local Rank') label = 'Rang local';
        else if (m.label === 'Sales') label = 'Ventes';
        else if (m.label === 'SEO Score') label = 'Score SEO';
        else if (m.label === 'Recommendations') label = 'Recommandations';
        else if (m.label === 'Online Orders') label = 'Commandes en ligne';
        else if (m.label === 'User Rating') label = 'Note utilisateur';
        else if (m.label === 'Conv. Rate') label = 'Taux de conv.';
        else if (m.label === 'Security') label = 'Sécurité';
        else if (m.label === 'Load') label = 'Chargement';
        return { ...m, label };
      });
      let quote = study.quote;
      let quoteAuthor = study.quoteAuthor;

      if (study.id === 'hotel-marrakech') {
        tag = 'Étude de Cas #1';
        industry = 'Hôtellerie';
        challenge = 'Le client avait besoin d\'un moteur de réservation directe pour réduire les commissions de Booking.com.';
        solution = 'Nous avons développé un tunnel de réservation sur mesure avec disponibilité en temps réel, passerelle de paiement et administration simplifiée.';
        quote = 'SuperSite a fourni exactement ce dont nous avions besoin. Les réservations directes ont augmenté et nous contrôlons nos tarifs.';
        quoteAuthor = 'Directeur d\'Hôtel, Marrakech';
      } else if (study.id === 'atlas-ecommerce') {
        tag = 'Étude de Cas #2';
        industry = 'E-Commerce';
        challenge = 'Migration d\'une boutique WordPress lente vers une stack moderne pour améliorer le SEO et le taux de conversion.';
        solution = 'Boutique personnalisée en Next.js avec recommandations de produits par IA, panier optimisé et référencement SEO avancé.';
        quote = 'Notre taux de conversion a triplé. La nouvelle boutique est haut de gamme et se charge en un clin d\'œil.';
        quoteAuthor = 'Fondateur, Atlas';
      } else if (study.id === 'restaurant-casablanca') {
        tag = 'Étude de Cas #3';
        industry = 'Restauration';
        challenge = 'Le client exigeait un menu en ligne, un système de réservation de tables et la prise de commande en livraison sur le même portail.';
        solution = 'Site responsive complet avec menu interactif, widget de réservation et connectivité avec les livreurs locaux.';
        quote = 'Nous avons cessé de perdre des commandes à cause de sites lents. Tout fonctionne parfaitement sur mobile.';
        quoteAuthor = 'Propriétaire, Casablanca';
      } else if (study.id === 'fintech-rabat') {
        tag = 'Étude de Cas #4';
        industry = 'FinTech';
        challenge = 'Lancer une landing page rassurante et ultra-rapide pour capturer des leads qualifiés pour un nouveau produit financier.';
        solution = 'Landing page à forte valeur ajoutée avec badges de confiance, formulaire de capture de leads et synchronisation Calendly.';
        quote = 'Professionnel et extrêmement rapide. Nous avons capturé des inscriptions dès le premier mois.';
        quoteAuthor = 'Responsable Marketing, Rabat';
      }

      return {
        ...study,
        tag,
        industry,
        challenge,
        solution,
        metrics,
        quote,
        quoteAuthor
      };
    }
    return study;
  });

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden" style={{ backgroundColor: 'var(--section-bg)' }}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">Portfolio</h2>
            <p className="text-[var(--text-secondary)]">
              {language === 'FR' 
                ? "Résultats concrets. ROI maximal. Nous ne faisons pas que concevoir — nous améliorons vos indicateurs."
                : "Real results. Real ROI. We don't just design — we improve metrics."}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {caseStudiesLocal.map((study) => (
            <div
              key={study.id}
              className="glass-panel p-8 rounded-3xl transition-all group hover:shadow-[0_25px_60px_rgba(30,144,255,0.2)] cursor-pointer"
              onClick={() => setSelectedStudy(study)}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  study.tagColor === 'accent-secondary' ? 'text-[var(--accent-secondary)]' : 'text-[var(--accent-primary)]'
                }`}>
                  {study.tag}
                </span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">{study.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{study.industry}</p>
              <p className="text-[var(--text-secondary)] mb-6 line-clamp-2">{study.challenge}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {study.metrics.map((m, i) => (
                  <div key={i} className="surface-muted p-3 rounded-xl text-center">
                    <div className="text-lg font-bold text-[var(--accent-primary)]">{m.value}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{m.label}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="text-sm font-bold text-[var(--accent-primary)] hover:underline"
                onClick={(e) => { e.stopPropagation(); setSelectedStudy(study); }}
              >
                {language === 'FR' ? "Lire la suite →" : "Read more →"}
              </button>
            </div>
          ))}
        </motion.div>
      </div>

      <CaseStudyModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
    </section>
  );
};

export default CaseStudies;

