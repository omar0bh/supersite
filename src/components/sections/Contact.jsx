import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import { API_ENDPOINTS } from '../../config/api';

const Contact = () => {
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

  const lastSyncedSignature = useRef('');

  // Load data from localStorage - check continuously
  useEffect(() => {
    const loadPricingData = () => {
      try {
        const savedOptions = localStorage.getItem('selectedOptions');
        const savedPrice = localStorage.getItem('finalPrice');
        const currentSignature = savedOptions + '-' + savedPrice;

        if (savedOptions && savedPrice) {
          // Only update if data has actually changed
          if (currentSignature === lastSyncedSignature.current) {
            return;
          }
          lastSyncedSignature.current = currentSignature;

          const selectedOptions = JSON.parse(savedOptions);
          const finalPrice = parseInt(savedPrice, 10);

          console.log('✓ LOADED FROM LOCALSTORAGE:', {
            selectedOptions,
            finalPrice
          });

          // Store pricing data for display
          setPricingData({
            features: selectedOptions,
            total: finalPrice
          });

          // Build formatted multiline text
          let formattedText = 'Selected Options:\n';

          if (selectedOptions.length > 0) {
            selectedOptions.forEach(option => {
              formattedText += `• ${option.name} (+${option.price} DH)\n`;
            });
          } else {
            formattedText += '• Base Package Only\n';
          }

          formattedText += `\nTotal Price: ${finalPrice} DH`;

          // Set the formatted text in description
          setDescription(formattedText);
        } else {
          // No pricing data found (expected if user came directly to contact)
          setPricingData(null);
        }
      } catch (error) {
        console.error('❌ Error loading pricing data:', error);
      }
    };

    // Load immediately
    loadPricingData();

    // Check every second for new data
    const interval = setInterval(loadPricingData, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !description.trim()) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get pricing data from localStorage
      const savedOptions = localStorage.getItem('selectedOptions');
      const savedPrice = localStorage.getItem('finalPrice');

      const submissionData = {
        name: name.trim(),
        phone: phone.trim(),
        description: description.trim(),
      };

      // Add pricing data if available
      if (savedOptions && savedPrice) {
        const selectedOptions = JSON.parse(savedOptions);
        submissionData.selectedFeatures = selectedOptions;
        submissionData.totalPrice = parseInt(savedPrice, 10);
        submissionData.estimatedDelivery = selectedOptions.length > 3 ? '10-14 Days' : '5-7 Days';
      }

      const response = await fetch(API_ENDPOINTS.SAVE_OFFER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response && response.ok) {
        setName('');
        setPhone('');
        setDescription('');
        localStorage.removeItem('selectedOptions');
        localStorage.removeItem('finalPrice');
        setPricingData(null); // Clear the UI box immediately
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.message || 'Validation failed.';
        setContactErrorMessage(serverError);
        setSubmitStatus('error');
        setTimeout(() => {
          setSubmitStatus(null);
          setContactErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!feedbackName.trim() || !feedbackText.trim() || feedbackRating === 0) {
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus(null), 3000);
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
        const serverError = errorData.message || 'Validation failed. Please check your inputs.';
        setFeedbackErrorMessage(serverError);
        setFeedbackStatus('error');
        setTimeout(() => {
          setFeedbackStatus(null);
          setFeedbackErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      let errorMessage = 'Failed to submit feedback.';

      // Better error messages based on error type
      const errorString = String(error.message || error).toLowerCase();

      if (errorString.includes('failed to fetch') || errorString.includes('networkerror') || error.name === 'TypeError') {
        // Check if trying to connect to Heroku from localhost (CORS issue)
        if (API_ENDPOINTS.SAVE_FEEDBACK.includes('herokuapp.com') && window.location.hostname === 'localhost') {
          errorMessage = 'CORS Error: Using Heroku URL from localhost. For local development, make sure your .env has REACT_APP_API_URL=http://localhost:3003 and restart the app.';
        } else if (API_ENDPOINTS.SAVE_FEEDBACK.includes('localhost')) {
          errorMessage = 'Cannot connect to server. Make sure the server is running: npm run server';
        } else {
          errorMessage = 'Network error. Please check your connection or try again later.';
        }
      } else if (errorString.includes('cors')) {
        errorMessage = 'CORS error detected. If running locally, ensure REACT_APP_API_URL=http://localhost:3003 in your .env file.';
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
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[var(--text-primary)]">Let's build the <br /> <span className="text-[var(--accent-primary)]">Extraordinary.</span></h2>
            <p className="text-[var(--text-secondary)] text-lg mb-12">Ready to dominate your market? Send us a message.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-primary)]"><Phone /></div>
                <div><div className="text-sm text-[var(--text-secondary)]">Call Us</div><div className="font-bold text-[var(--text-primary)]">+212761551689</div></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-secondary)]"><Mail /></div>
                <div><div className="text-sm text-[var(--text-secondary)]">Email Us</div><div className="font-bold text-[var(--text-primary)]">SuperSite@SuperSite.ma</div></div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {pricingData && pricingData.features && pricingData.features.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 shadow-lg mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-bold text-[var(--text-primary)]">
                      ✨ Your Selected Quote
                    </span>
                    <span className="text-2xl font-bold text-blue-400">{pricingData.total} DH</span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mb-3">
                    Base Package (2000 DH) + {pricingData.features.length} feature(s)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pricingData.features.map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/30 rounded-lg text-blue-300 text-sm font-bold border border-blue-400/30">
                        {f.name} (+{f.price} DH)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl px-6 py-4 outline-none input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl px-6 py-4 outline-none input-field"
                  required
                />
              </div>
              <textarea
                placeholder="Tell us about your vision..."
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl px-6 py-4 outline-none input-field resize-none"
                required
              ></textarea>
              <div className="space-y-2">
                <Button type="submit" variant="neon" className="w-full py-5 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Send Request'}
                </Button>
                {submitStatus === 'success' && (
                  <div className="flex items-center gap-2 text-[var(--accent-secondary)] text-sm">
                    <CheckCircle size={16} />
                    <span>Your request has been saved successfully!</span>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <XCircle size={16} />
                    <span>{contactErrorMessage || 'Failed to save. Please make sure the server is running.'}</span>
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
              Share Your Experience
            </h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-xl mx-auto">
              Your feedback helps us improve!
            </p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="max-w-xl mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your name"
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
                  Please select a rating
                </p>
              )}
            </div>

            <div>
              <textarea
                placeholder="Tell us what you think..."
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
                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>

              {feedbackStatus === 'success' && (
                <div className="flex items-center gap-2 text-[var(--accent-secondary)] text-xs">
                  <CheckCircle size={14} />
                  <span>Thank you for your feedback!</span>
                </div>
              )}

              {feedbackStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <XCircle size={14} />
                  <span>
                    {feedbackRating === 0
                      ? 'Please select a rating before submitting.'
                      : feedbackErrorMessage || 'Failed to submit. Make sure the server is running.'}
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
