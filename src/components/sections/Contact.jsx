import { useState, useEffect } from 'react';
import { Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import { API_ENDPOINTS } from '../../config/api';

const Contact = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [pricingData, setPricingData] = useState(null);

  // Load data from localStorage - check continuously
  useEffect(() => {
    const loadPricingData = () => {
      try {
        const savedOptions = localStorage.getItem('selectedOptions');
        const savedPrice = localStorage.getItem('finalPrice');

        if (savedOptions && savedPrice) {
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
          console.log('⚠️ NO PRICING DATA IN LOCALSTORAGE');
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
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="glass-panel rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row gap-16">
           <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 text-[var(--text-primary)]">Let's build the <br/> <span className="text-[var(--accent-primary)]">Extraordinary.</span></h2>
              <p className="text-[var(--text-secondary)] text-lg mb-12">Ready to dominate your market? Send us a message.</p>
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-primary)]"><Phone/></div>
                   <div><div className="text-sm text-[var(--text-secondary)]">Call Us</div><div className="font-bold text-[var(--text-primary)]">+212 6XX-XXXXXX</div></div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full icon-bubble flex items-center justify-center text-[var(--accent-secondary)]"><Mail/></div>
                   <div><div className="text-sm text-[var(--text-secondary)]">Email Us</div><div className="font-bold text-[var(--text-primary)]">hello@SuperTech.ma</div></div>
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
                     <span>Failed to save. Please make sure the server is running.</span>
                   </div>
                 )}
               </div>
             </form>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
