import React, { useEffect, useRef, useState } from 'react';
import { Bot, Calendar, PenTool, MessageCircle, Loader, Send, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { API_ENDPOINTS } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

const AITools = () => {
  const { t, language } = useLanguage();
  const [activeAiTab, setActiveAiTab] = useState('estimator');
  const [quoteInput, setQuoteInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copyTopic, setCopyTopic] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [rateLimitHit, setRateLimitHit] = useState(false);
  
  // Set welcome message dynamically based on language
  const welcomeMessage = language === 'FR'
    ? "Bonjour ! Je suis Super. Je peux vous aider à choisir un modèle de site, vous expliquer nos tarifs ou suggérer la meilleure stack technique. Comment puis-je vous aider ?"
    : "Hi there! I'm Super. I can help you choose a template, explain our pricing, or suggest the best Site stack. How can I help?";

  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: welcomeMessage }
  ]);

  // Sync welcome message when language changes
  useEffect(() => {
    setChatHistory(prev => {
      if (prev.length === 1 && prev[0].role === 'ai') {
        return [{ role: 'ai', text: welcomeMessage }];
      }
      return prev;
    });
  }, [language, welcomeMessage]);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (activeAiTab !== 'chat') return;

    const timeoutId = setTimeout(() => {
      if (chatContainerRef.current && chatEndRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatHistory, activeAiTab]);

  const handleEstimator = async () => {
    if (!quoteInput.trim()) return;
    setIsProcessing(true);
    setAiResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.AI_ESTIMATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: quoteInput })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) setRateLimitHit(true);
        if (response.status === 404) {
          throw new Error(language === 'FR' ? 'Point de terminaison introuvable. Assurez-vous que le serveur est démarré.' : 'Server endpoint not found. Make sure the server is running.');
        }
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setRateLimitHit(false);
        setAiResult(result.data);
      } else {
        throw new Error(result.error || 'Failed to get estimate');
      }
    } catch (error) {
      let errorMessage = error.message || (language === 'FR' ? "Échec de connexion au service d'IA." : 'Failed to connect to AI service.');

      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = language === 'FR' 
          ? 'Connexion au serveur impossible. Lancez le serveur : npm run server'
          : 'Cannot connect to server. Make sure the server is running: npm run server';
      }

      setRateLimitHit(/too many|rate limit|429/i.test(error.message || ''));
      setAiResult({
        error: true,
        message: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    const str = typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text);
    navigator.clipboard.writeText(str).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyGen = async () => {
    if (!copyTopic.trim()) return;
    setIsProcessing(true);
    setGeneratedCopy('');

    try {
      const response = await fetch(API_ENDPOINTS.AI_COPY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: copyTopic })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) setRateLimitHit(true);
        if (response.status === 404) {
          throw new Error(language === 'FR' ? 'Point de terminaison introuvable. Assurez-vous que le serveur est démarré.' : 'Server endpoint not found. Make sure the server is running.');
        }
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setRateLimitHit(false);
        setGeneratedCopy(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate copy');
      }
    } catch (error) {
      let errorMessage = error.message || (language === 'FR' ? "Échec de connexion au service d'IA." : 'Failed to connect to AI service.');

      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = language === 'FR'
          ? 'Connexion au serveur impossible. Lancez le serveur : npm run server'
          : 'Cannot connect to server. Make sure the server is running: npm run server';
      }

      setRateLimitHit(/too many|rate limit|429/i.test(errorMessage));
      setGeneratedCopy(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e?.preventDefault?.();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const updatedHistory = [...chatHistory, { role: 'user', text: userMsg }];

    setChatHistory(updatedHistory);
    setChatInput('');
    setIsProcessing(true);

    try {
      const response = await fetch(API_ENDPOINTS.AI_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          userMessage: userMsg
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setChatHistory(prev => [...prev, { role: 'ai', text: String(result.data) }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: result.message || (language === 'FR' ? "J'ai du mal à me connecter. Veuillez réessayer." : "I'm having trouble connecting right now. Please try again.") }]);
      }
    } catch (error) {
      let errorMessage = language === 'FR' ? "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer." : "I'm sorry, I encountered an error. Please try again.";

      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
        errorMessage = language === 'FR'
          ? "Connexion au serveur impossible. Lancez le serveur : npm run server"
          : "Cannot connect to server. Make sure the server is running: npm run server";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setRateLimitHit(/too many|rate limit|429/i.test(error.message || ''));
      setChatHistory(prev => [...prev, {
        role: 'ai',
        text: errorMessage
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="ai-tools" className="py-32 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 text-[var(--accent-primary)] font-bold tracking-widest uppercase text-sm">
            <Bot size={16} /> {language === 'FR' ? "Technologie Exclusive" : "Exclusive Technology"}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
            {language === 'FR' ? "Outils IA de l'Agence" : "AI Agency Tools"}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4">
            {language === 'FR' ? "Découvrez la puissance de l'IA Gemini avant même de nous embaucher." : "Experience the power of Gemini AI before you even hire us."}
          </p>
          <p className="text-sm text-[var(--accent-primary)] font-medium mt-2">
            {language === 'FR' ? "Testez notre IA avant de collaborer — sans inscription." : "Try our AI before you hire us — no signup."}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            {language === 'FR' ? "Propulsé par Gemini IA. Données cryptées ; nous ne stockons pas la description de votre projet." : "Powered by Gemini AI. Secure; we don't store your project description."}
          </p>
        </motion.div>

        <motion.div
          className="glass-panel max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row border-b border-[var(--border-color)]">
            <button onClick={() => setActiveAiTab('estimator')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeAiTab === 'estimator' ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Calendar size={18} /> {language === 'FR' ? "Estimateur de Projet" : "Project Estimator"}
            </button>
            <button onClick={() => setActiveAiTab('copy')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeAiTab === 'copy' ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <PenTool size={18} /> {language === 'FR' ? "Générateur de Contenu" : "AI Copy Generator"}
            </button>
            <button onClick={() => setActiveAiTab('chat')} className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeAiTab === 'chat' ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <MessageCircle size={18} /> {language === 'FR' ? "Support Intelligent" : "Smart Support"}
            </button>
          </div>

          <div className="p-8 min-h-[400px] flex flex-col">
            {activeAiTab === 'estimator' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
                  {language === 'FR' ? "Obtenez un Tarif Instantané" : "Get an Instant Quote"}
                </h3>
                <p className="text-[var(--text-secondary)] mb-2">
                  {language === 'FR' ? "Décrivez votre projet et notre IA vous recommandera la stack, le prix et le délai." : "Describe your project and our AI will recommend the stack, price, and timeline."}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mb-6">
                  {language === 'FR' ? 'ex. "Restaurant à Marrakech avec commande en ligne et réservations"' : 'e.g. "Restaurant in Marrakech with online ordering and reservations"'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleEstimator(); }} className="flex gap-2 mb-6">
                  <input type="text" value={quoteInput} onChange={(e) => setQuoteInput(e.target.value)} placeholder={language === 'FR' ? "Décrivez votre projet..." : "Describe your project..."} className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <Button type="submit" variant="neon" disabled={isProcessing}>{isProcessing ? <Loader className="animate-spin" /> : (language === 'FR' ? "Analyser" : "Analyze")}</Button>
                </form>

                {rateLimitHit && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                    {language === 'FR' ? (
                      <span>Vous avez atteint la limite actuelle. <a href="#contact" className="font-bold underline">Contactez-nous</a> pour plus d'estimations.</span>
                    ) : (
                      <span>You&apos;ve hit the limit for now. <a href="#contact" className="font-bold underline">Contact us</a> for more AI estimates.</span>
                    )}
                  </div>
                )}

                {aiResult && typeof aiResult === 'object' && (
                  <div className={`rounded-xl p-6 border-l-4 ${aiResult.error ? 'bg-red-500/10 border-red-500' : 'bg-[var(--surface-muted)] border-[var(--accent-primary)]'}`}>
                    {aiResult.error ? (
                      <div className="text-red-500">
                        <p className="font-bold mb-2">Error:</p>
                        <p>{aiResult.message}</p>
                        <p className="text-sm mt-2 text-[var(--text-secondary)]">{language === 'FR' ? "Vérifiez que le serveur fonctionne." : "Make sure the server is running."}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                          <div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase font-bold">{language === 'FR' ? "Formule Recommandée" : "Recommended Plan"}</div>
                            <div className="text-2xl font-bold text-[var(--accent-primary)]">{aiResult.package || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[var(--text-secondary)] uppercase font-bold">{language === 'FR' ? "Budget Estimé" : "Est. Price"}</div>
                            <div className="text-2xl font-bold text-[var(--text-primary)]">{aiResult.price || 'N/A'}</div>
                          </div>
                          <button type="button" onClick={() => copyToClipboard(aiResult, 'estimate')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[var(--surface-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]">
                            {copiedId === 'estimate' ? <Check size={14} /> : <Copy size={14} />} {copiedId === 'estimate' ? (language === 'FR' ? 'Copié' : 'Copied') : (language === 'FR' ? 'Copier' : 'Copy')}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-[var(--text-primary)] mb-4">
                          <div className="surface-muted p-2 rounded">⏳ {aiResult.time || 'N/A'}</div>
                          <div className="surface-muted p-2 rounded">💻 {aiResult.stack || 'N/A'}</div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-[var(--text-secondary)] uppercase font-bold mb-2">{language === 'FR' ? "Fonctionnalités Clés" : "Key Features"}</div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-primary)]">
                            {Array.isArray(aiResult.features)
                              ? aiResult.features.map((f, i) => <li key={i}>{String(f)}</li>)
                              : <li>{String(aiResult.features)}</li>}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'copy' && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
                  {language === 'FR' ? "Générateur de Titres IA" : "AI Headline Generator"}
                </h3>
                <p className="text-[var(--text-secondary)] mb-2">
                  {language === 'FR' ? "Panne d'inspiration ? Laissez notre IA rédiger instantanément la section d'accroche de votre site." : "Stuck on content? Let our AI write your website&apos;s hero section instantly."}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mb-6">
                  {language === 'FR' ? 'ex. "Café chaleureux à Rabat avec café de spécialité"' : 'e.g. "Cozy café in Rabat with specialty coffee"'}
                </p>
                <form onSubmit={(e) => { e.preventDefault(); handleCopyGen(); }} className="flex gap-2 mb-6">
                  <input type="text" value={copyTopic} onChange={(e) => setCopyTopic(e.target.value)} placeholder={language === 'FR' ? "Quel est le domaine de votre entreprise ?" : "What is your business about?"} className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <Button type="submit" variant="neon" disabled={isProcessing}>{isProcessing ? <Loader className="animate-spin" /> : (language === 'FR' ? "Générer" : "Generate")}</Button>
                </form>
                {rateLimitHit && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
                    {language === 'FR' ? <span>Limite atteinte. <a href="#contact" className="font-bold underline">Contactez-nous</a>.</span> : <span>Limit reached. <a href="#contact" className="font-bold underline">Contact us</a> for more.</span>}
                  </div>
                )}
                {generatedCopy && typeof generatedCopy === 'string' && !generatedCopy.startsWith('Error:') && (
                  <div className="bg-[var(--surface-muted)] rounded-xl p-6 border border-[var(--border-color)] relative group">
                    <button type="button" onClick={() => copyToClipboard(generatedCopy, 'copy')} className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs bg-[var(--surface-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]">
                      {copiedId === 'copy' ? <Check size={12} /> : <Copy size={12} />} {copiedId === 'copy' ? (language === 'FR' ? 'Copié' : 'Copied') : (language === 'FR' ? 'Copier' : 'Copy')}
                    </button>
                    {generatedCopy.split('|').map((part, index) => (
                      <p key={index} className={`font-medium ${index === 0 ? 'text-xl text-[var(--text-primary)] mb-2' : 'text-lg italic text-[var(--text-secondary)]'}`}>
                        {String(part).trim()}
                      </p>
                    ))}
                  </div>
                )}
                {generatedCopy && typeof generatedCopy === 'string' && generatedCopy.startsWith('Error:') && (
                  <div className="bg-red-500/10 rounded-xl p-4 border border-red-500 text-red-500 text-sm">{generatedCopy}</div>
                )}
              </div>
            )}

            {activeAiTab === 'chat' && (
              <div className="flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
                  {language === 'FR' ? "Discutez avec l'IA Super" : "Chat with Super"}
                </h3>
                <div ref={chatContainerRef} className="flex-1 rounded-xl p-4 mb-4 overflow-y-auto max-h-[300px] scrollbar-hide surface-muted">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--accent-primary)] text-white rounded-tr-none' : 'bg-[var(--surface-muted)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'}`}>
                        {String(msg.text)}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-[var(--surface-muted)] p-3 rounded-2xl rounded-tl-none max-w-[80%] border border-[var(--border-color)]">
                        <Loader size={20} className="animate-spin text-[var(--text-secondary)]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={language === 'FR' ? "Posez une question..." : "Ask a question..."} className="flex-1 rounded-xl px-4 py-3 outline-none input-field" />
                  <button type="submit" className="bg-[var(--accent-primary)] hover:opacity-90 text-white p-3 rounded-xl transition-colors disabled:opacity-50" disabled={isProcessing}><Send size={20} /></button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AITools;
