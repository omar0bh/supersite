import { useState } from 'react';
import { Layers, ChevronRight, ChevronLeft, Download, MessageSquare, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { featuresList } from '../../config/data';
import { useLanguage } from '../../context/LanguageContext';

const BASE_INCLUDES = ['Responsive design', 'Premium styling', '1 round of revisions', '48h delivery'];

const PricingCalculator = ({ onContact }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [calcFeatures, setCalcFeatures] = useState([]);
  const [calcTotal, setCalcTotal] = useState(2000);
  const { t, language } = useLanguage();

  const baseIncludesLocal = language === 'FR'
    ? ["Design Responsive mobile/tablette", "Design Visuel Premium & Moderne", "Session de révisions incluse", "Prêt pour hébergement de production"]
    : BASE_INCLUDES;

  const featuresListLocal = featuresList.map(item => {
    let name = item.name;
    let tooltip = item.tooltip;
    if (language === 'FR') {
      if (item.id === 'cms') {
        name = "Tableau de Bord Admin (CMS)";
        tooltip = "Gérez vos contenus, menus et médias sans coder.";
      } else if (item.id === 'seo') {
        name = "Référencement SEO Avancé";
        tooltip = "Balises meta, sitemaps et structure optimisée Google.";
      } else if (item.id === 'pay') {
        name = "Passerelle de Paiement";
        tooltip = "Intégration Stripe, CMI ou solutions de paiement locales.";
      } else if (item.id === 'lang') {
        name = "Support Multilingue";
        tooltip = "Français, Arabe, Anglais - commutateur utilisateur instantané.";
      } else if (item.id === 'chat') {
        name = "Chatbot IA Intelligent";
        tooltip = "Agent de support intelligent entraîné sur vos offres.";
      } else if (item.id === 'anim') {
        name = "Animations Web Premium";
        tooltip = "Animations au survol et défilement pour un rendu haute couture.";
      } else if (item.id === 'branding') {
        name = "Pack Design & Branding (Logo)";
        tooltip = "Identité visuelle complète, logo haute définition et charte graphique.";
      } else if (item.id === 'maintenance') {
        name = "Maintenance Technique Annuelle";
        tooltip = "Sauvegardes de sécurité régulières, mises à jour et assistance.";
      } else if (item.id === 'google_ads') {
        name = "Campagne Google Ads & Trafic";
        tooltip = "Étude de mots-clés, configuration de campagnes et tracking de conversion.";
      }
    }
    return { ...item, name, tooltip };
  });

  const toggleFeature = (price, id) => {
    if (calcFeatures.includes(id)) {
      setCalcFeatures(calcFeatures.filter(f => f !== id));
      setCalcTotal(prev => prev - price);
    } else {
      setCalcFeatures(prev => [...prev, id]);
      setCalcTotal(prev => prev + price);
    }
  };

  const handleStartProject = () => {
    const selectedOptions = calcFeatures.map(featureId => {
      const feature = featuresListLocal.find(f => f.id === featureId);
      return {
        id: feature.id,
        name: feature.name,
        price: feature.price
      };
    });

    localStorage.setItem('selectedOptions', JSON.stringify(selectedOptions));
    localStorage.setItem('finalPrice', calcTotal.toString());
    onContact();
  };

  const handleWhatsAppBooking = () => {
    const selectedOptionsNames = calcFeatures.map(fid => {
      const f = featuresListLocal.find(i => i.id === fid);
      return `• ${f.name} (+${f.price} DH)`;
    });

    const msg = language === 'FR'
      ? `Bonjour SuperSite ! Je viens de générer une proposition personnalisée de *${calcTotal} DH* pour mon projet web.\n\n` +
        `*Modules Sélectionnés :*\n${selectedOptionsNames.length > 0 ? selectedOptionsNames.join('\n') : 'Formule Template de Base Uniquement'}\n\n` +
        `Je souhaite réserver un créneau de consultation gratuit pour démarrer !`
      : `Hi SuperSite! I just generated a custom agency proposal of *${calcTotal} DH* for my website project.\n\n` +
        `*Selected Modules:*\n${selectedOptionsNames.length > 0 ? selectedOptionsNames.join('\n') : 'Base Template Package Only'}\n\n` +
        `I'd like to book a free consultation to discuss starting the project!`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/212761551686?text=${encodedMsg}`, '_blank');
  };

  const handleDownloadProposal = () => {
    const printWindow = window.open('', '_blank');
    const selectedItemsHtml = calcFeatures.map(fid => {
      const f = featuresListLocal.find(i => i.id === fid);
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; color: #334155; font-size: 14px;">${f.name}</td>
          <td style="padding: 12px 0; color: #475569; font-size: 14px;">${language === 'FR' ? 'Option Premium' : 'Dynamic Add-on'}</td>
          <td style="padding: 12px 0; text-align: right; color: #0f172a; font-weight: 700; font-size: 14px;">+${f.price} DH</td>
        </tr>
      `;
    }).join('');

    const today = new Date().toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${language === 'FR' ? 'Proposition Commerciale Premium - SuperSite' : 'Premium Commercial Proposal - SuperSite'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 40px;
            color: #0f172a;
            background-color: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -1px;
          }
          .logo span {
            color: #3b82f6;
          }
          .proposal-title {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 10px;
          }
          .proposal-meta {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 30px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
          }
          .party-details {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
          }
          .party-title {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          .party-name {
            font-size: 16px;
            font-weight: 600;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .table th {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            text-align: left;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .total-box {
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            padding: 24px;
            border-radius: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }
          .total-price {
            font-size: 32px;
            font-weight: 800;
          }
          .terms {
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .signature-area {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px dashed #e2e8f0;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #0f172a;
            margin-top: 40px;
            padding-top: 8px;
            font-size: 12px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Super<span>Site</span></div>
          <div style="text-align: right; font-size: 14px; color: #64748b;">${language === 'FR' ? "Proposition d'estimation" : "Proposal Estimate"} #PRO-${Date.now().toString().substring(8)}</div>
        </div>

        <h1 class="proposal-title">${language === 'FR' ? "Proposition Commerciale de Création Web" : "Commercial Web Design Proposal"}</h1>
        <div class="proposal-meta">${language === 'FR' ? "Généré le" : "Generated on"} ${today} • ${language === 'FR' ? "Valable 30 jours • Agence Web SuperSite Maroc" : "Valid for 30 days • SuperSite Web Agency Morocco"}</div>

        <div class="grid">
          <div class="party-details">
            <div class="party-title">${language === 'FR' ? "PRESTATAIRE" : "PROVIDER"}</div>
            <div class="party-name">${language === 'FR' ? "Agence Digitale SuperSite" : "SuperSite Digital Agency"}</div>
            <div style="color: #64748b; font-size: 14px; margin-top: 4px;">Casablanca, Maroc<br/>Email: contact@supersite.ma<br/>WhatsApp: +212 761-551686</div>
          </div>
          <div class="party-details">
            <div class="party-title">${language === 'FR' ? "BÉNÉFICIAIRE" : "BENEFICIARY"}</div>
            <div class="party-name">${language === 'FR' ? "Client Estimé / Futur Partenaire" : "Valued Client / Future Partner"}</div>
            <div style="color: #64748b; font-size: 14px; margin-top: 4px;">${language === 'FR' ? "Proposition commerciale sur-mesure<br/>basée sur les spécifications sélectionnées." : "Tailored commercial proposal<br/>based on selected parameters."}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 50%;">${language === 'FR' ? "Solution / Module" : "Solution / Module"}</th>
              <th style="width: 30%;">${language === 'FR' ? "Type" : "Type"}</th>
              <th style="width: 20%; text-align: right;">${language === 'FR' ? "Tarif (DH)" : "Price (DH)"}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 0; color: #334155; font-size: 14px; font-weight: 600;">${language === 'FR' ? "Formule Site Web de Base (Modèle Responsive)" : "Base Website Package (Responsive Template)"}</td>
              <td style="padding: 12px 0; color: #475569; font-size: 14px;">${language === 'FR' ? "Architecture Centrale" : "Core Architecture"}</td>
              <td style="padding: 12px 0; text-align: right; color: #0f172a; font-weight: 700; font-size: 14px;">2000 DH</td>
            </tr>
            ${selectedItemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 600; opacity: 0.8; letter-spacing: 0.5px;">${language === 'FR' ? "Estimation Globale Projet" : "Global Project Estimate"}</div>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">${language === 'FR' ? "Hébergement & support initiaux inclus" : "Initial hosting & support included"}</div>
          </div>
          <div class="total-price">${calcTotal} DH</div>
        </div>

        <div class="terms">
          <strong>${language === 'FR' ? "Conditions Générales :" : "Terms & Conditions:"}</strong><br/>
          1. ${language === 'FR' ? "Cette estimation est générée de manière algorithmique sur la base des besoins exprimés. Un devis final contractuel sera établi après la séance de consultation." : "This estimate is algorithmically generated based on specified inputs. A final contractual quote will be signed after consultation."}<br/>
          2. ${language === 'FR' ? "Modalités de paiement standard : 50% d'acompte à la commande, 50% à la livraison finale." : "Standard terms: 50% downpayment, 50% on final launch."}<br/>
          3. ${language === 'FR' ? `Délais de livraison estimés : ${calcFeatures.length > 3 ? '10-14 jours ouvrables' : '5-7 jours ouvrables'} à compter de la réception des contenus.` : `Estimated delivery: ${calcFeatures.length > 3 ? '10-14 business days' : '5-7 business days'} from receiving all client assets.`}
        </div>

        <div class="signature-area">
          <div class="signature-box">
            <div style="font-weight: 600; font-size: 14px;">${language === 'FR' ? "Pour SuperSite" : "For SuperSite"}</div>
            <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #3b82f6; margin-top: 15px; font-style: italic;">Omar Admin (Signé)</div>
            <div class="signature-line">${language === 'FR' ? "Signature & Cachet" : "Signature & Stamp"}</div>
          </div>
          <div class="signature-box">
            <div style="font-weight: 600; font-size: 14px;">${language === 'FR' ? "Pour le Client" : "For the Client"}</div>
            <div class="signature-line">${language === 'FR' ? 'Signature du Client ("Bon pour accord")' : 'Client Signature ("Approved")'}</div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 60px; text-align: center;">
          <button onclick="window.print();" style="background-color: #2563eb; color: white; border: none; padding: 12px 30px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">${language === 'FR' ? "Imprimer / Enregistrer en PDF" : "Print / Save as PDF"}</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const stepsData = [
    {
      step: 1,
      title: language === 'FR' ? "Infrastructure de Base" : "Core Infrastructure",
      desc: language === 'FR'
        ? "Chaque package comprend notre architecture de base haut de gamme, réactive et optimisée."
        : "Every package includes our high-end, responsive foundational architecture.",
      features: []
    },
    {
      step: 2,
      title: language === 'FR' ? "Modules Intelligents & Interactifs" : "Interactive Smart Modules",
      desc: language === 'FR'
        ? "Intégrez des fonctionnalités dynamiques puissantes pour convertir vos visiteurs et gérer votre flux."
        : "Integrate powerful dynamic features to convert visitors and manage business flows.",
      features: featuresListLocal.slice(0, 4) // cms, seo, pay, lang
    },
    {
      step: 3,
      title: language === 'FR' ? "Croissance & Accélération" : "Business Growth & Scaling",
      desc: language === 'FR'
        ? "Propulsez la visibilité de votre site, votre identité de marque et votre trafic qualifié."
        : "Supercharge your website visibility, brand identity, and traffic lead capture.",
      features: featuresListLocal.slice(4) // chat, anim, branding, maintenance, google_ads
    },
    {
      step: 4,
      title: language === 'FR' ? "Résumé de la Proposition Premium" : "Premium Proposal Summary",
      desc: language === 'FR'
        ? "Examinez votre contrat de proposition détaillé, téléchargez votre PDF ou lancez votre consultation WhatsApp."
        : "Review your detailed proposal contract, download PDF invoice, or secure your WhatsApp consultation.",
      features: []
    }
  ];

  const activeStep = stepsData[currentStep - 1];

  return (
    <section id="pricing" className="py-32 transition-colors duration-500 bg-[var(--color-bg)]">
      <div className="container mx-auto px-6">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="badge-gradient mb-4 inline-block">{language === 'FR' ? "Assistant d'Estimation Interactif" : "Interactive Estimator Wizard"}</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--text-primary)]">{language === 'FR' ? "Créez votre Proposition Commerciale" : "Build Your Agency Proposal"}</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-base">
            {language === 'FR'
              ? "Sélectionnez vos options dans notre assistant premium pour voir la livraison estimée, le calcul du prix et télécharger votre contrat de projet en direct."
              : "Select features in our premium multi-step wizard to see estimated delivery, price calculations, and download a customized agency contract PDF live."}
          </p>
        </div>

        {/* Wizard Multi-Step Progress Tracker */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-[var(--border-color)] -translate-y-1/2 -z-10 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] -translate-y-1/2 -z-10 rounded transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            {stepsData.map((s) => {
              const isCompleted = currentStep > s.step;
              const isActive = currentStep === s.step;
              return (
                <div key={s.step} className="flex flex-col items-center">
                  <button
                    onClick={() => s.step < currentStep && setCurrentStep(s.step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 relative ${
                      isCompleted 
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' 
                        : isActive 
                          ? 'bg-[var(--color-bg)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[var(--glow-primary)] scale-110' 
                          : 'bg-[var(--surface-muted)] border-[var(--border-color)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : s.step}
                  </button>
                  <span className={`text-[10px] md:text-xs font-bold mt-2 hidden sm:inline ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Wizard Card */}
          <div className="flex-1 w-full glass-panel p-6 md:p-10 rounded-3xl border border-[var(--border-color)] min-h-[420px] flex flex-col justify-between">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {/* Step info header */}
                <div className="mb-8">
                  <span className="text-xs font-extrabold text-[var(--accent-primary)] tracking-widest uppercase">
                    {language === 'FR' ? `Étape ${currentStep} sur 4` : `Step ${currentStep} of 4`}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mt-1">{activeStep.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{activeStep.desc}</p>
                </div>

                {/* STEP 1: Core Architecture Info */}
                {currentStep === 1 && (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {baseIncludesLocal.map((feature, i) => (
                        <div key={i} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <span className="text-sm font-bold text-[var(--text-primary)]">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 mt-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center text-xs text-blue-400 flex items-center justify-center gap-2">
                      <Sparkles size={14} />
                      {language === 'FR'
                        ? <span>Le tarif de base est sécurisé à <strong>2000 DH</strong> (architecture responsive de modèle).</span>
                        : <span>Base core pricing is secured at <strong>2000 DH</strong> (responsive layout).</span>}
                    </div>
                  </div>
                )}

                {/* STEP 2 & 3: Selection Cards list */}
                {(currentStep === 2 || currentStep === 3) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    {activeStep.features.map((item) => {
                      const isSelected = calcFeatures.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleFeature(item.price, item.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                            isSelected 
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-[var(--glow-primary)]/10' 
                              : 'bg-[var(--surface-muted)] border-[var(--border-color)] hover:bg-[var(--color-bg)] hover:border-[var(--text-secondary)]/30'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]'}`}>
                              {item.name}
                            </h4>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white' : 'border-[var(--border-color)]'
                            }`}>
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                          </div>
                          
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{item.tooltip}</p>
                          
                          <span className="text-xs font-mono font-extrabold text-[var(--accent-secondary)]">+{item.price} DH</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* STEP 4: Review Summary contract */}
                {currentStep === 4 && (
                  <div className="flex-1 flex flex-col space-y-4">
                    <div className="p-5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border-color)] flex flex-col space-y-3">
                      <div className="flex justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)]/50 pb-2">
                        <span>{language === 'FR' ? "Description du Module" : "Items Description"}</span>
                        <span>{language === 'FR' ? "Tarif Unitaire" : "Unit Pricing"}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-[var(--text-primary)]">{language === 'FR' ? "Site Web de Base (Responsive)" : "Base Website (Responsive)"}</span>
                        <span className="font-bold text-[var(--text-primary)]">2000 DH</span>
                      </div>

                      {calcFeatures.map((fid) => {
                        const f = featuresListLocal.find(i => i.id === fid);
                        return (
                          <div key={fid} className="flex justify-between text-xs text-[var(--text-secondary)]">
                            <span>{f.name}</span>
                            <span className="font-bold">+{f.price} DH</span>
                          </div>
                        );
                      })}

                      <div className="border-t border-[var(--border-color)] pt-3 flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{language === 'FR' ? "Budget Global Projet :" : "Estimated Projected Budget:"}</span>
                        <span className="text-2xl font-black text-[var(--accent-secondary)]">{calcTotal} DH</span>
                      </div>
                    </div>

                    {/* Funnel conversion triggers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={handleDownloadProposal}
                        className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-bold transition-all text-sm"
                      >
                        <Download size={16} />
                        {language === 'FR' ? "Télécharger la Proposition PDF" : "Download Proposal PDF"}
                      </button>
                      <button
                        onClick={handleWhatsAppBooking}
                        className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all text-sm shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                      >
                        <MessageSquare size={16} />
                        {language === 'FR' ? "Lancer la Discussion WhatsApp" : "Book WhatsApp Consulting"}
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Step navigation controls */}
            <div className="flex justify-between items-center mt-8 border-t border-[var(--border-color)] pt-6">
              <button
                onClick={() => currentStep > 1 && setCurrentStep(prev => prev - 1)}
                className={`flex items-center gap-1 text-xs font-bold py-2.5 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all ${
                  currentStep === 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                disabled={currentStep === 1}
              >
                <ChevronLeft size={16} />
                {language === 'FR' ? "Retour" : "Back"}
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-1 text-xs font-bold py-2.5 px-5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white transition-all shadow-[var(--glow-primary)]/10"
                >
                  {language === 'FR' ? "Étape Suivante" : "Next Step"}
                  <ChevronRight size={16} />
                </button>
              ) : (
                <Button 
                  onClick={handleStartProject} 
                  variant="neon" 
                  className="!py-2.5 !px-6"
                >
                  🚀 {language === 'FR' ? "Réserver mon Projet" : "Prefill & Book Order"}
                </Button>
              )}
            </div>

          </div>

          {/* Right Floating Quote Summary Panel */}
          <div className="lg:w-1/3 w-full sticky top-32">
            <div className="rounded-3xl p-8 text-white relative overflow-hidden shadow-[var(--glow-primary)] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              
              <h3 className="text-lg font-bold opacity-80 mb-2 relative flex items-center gap-2">
                <Layers size={18} />
                {language === 'FR' ? "Votre Devis en Direct" : "Your Live Estimate"}
              </h3>
              
              <div className="text-5xl font-black mb-6 relative">
                {calcTotal} <span className="text-xl font-medium">DH</span>
              </div>

              {/* Items Selected */}
              <div className="space-y-2 mb-8 relative text-xs opacity-80 border-t border-white/20 pt-4 max-h-[160px] overflow-y-auto pr-1">
                <div className="flex justify-between font-bold">
                  <span>{language === 'FR' ? "Module Site de Base" : "Base Architecture Pack"}</span>
                  <span>2000 DH</span>
                </div>
                {calcFeatures.map(fid => {
                  const f = featuresListLocal.find(i => i.id === fid);
                  return (
                    <div key={fid} className="flex justify-between">
                      <span>{f.name}</span>
                      <span>+{f.price} DH</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] bg-black/20 p-3 rounded-lg mb-6 relative font-bold">
                <span>{language === 'FR' ? "DÉLAI DE LIVRAISON ESTIMÉ" : "PROJECT DELIVERY TERM"}</span>
                <span className="text-yellow-400 font-extrabold uppercase tracking-wider">
                  {calcFeatures.length > 3 
                    ? (language === 'FR' ? '10-14 Jours (Standard)' : '10-14 Days (Standard)') 
                    : (language === 'FR' ? '5-7 Jours (Express)' : '5-7 Days (Express)')}
                </span>
              </div>

              <div className="text-[10px] text-center opacity-70 relative">
                {language === 'FR'
                  ? "Les valeurs estimées incluent 30 jours d'assistance premium."
                  : "Estimated values include 30-day premium support retainer."}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PricingCalculator;
