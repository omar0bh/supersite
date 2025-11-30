import { useState } from 'react';
import { Layers } from 'lucide-react';
import Button from '../ui/Button';
import { featuresList } from '../../config/data';

const PricingCalculator = ({ onContact }) => {
  const [calcFeatures, setCalcFeatures] = useState([]);
  const [calcTotal, setCalcTotal] = useState(2000);

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
    // Convert selected IDs to full objects { id, name, price }
    const selectedOptions = calcFeatures.map(featureId => {
      const feature = featuresList.find(f => f.id === featureId);
      return {
        id: feature.id,
        name: feature.name,
        price: feature.price
      };
    });

    // Save to localStorage
    localStorage.setItem('selectedOptions', JSON.stringify(selectedOptions));
    localStorage.setItem('finalPrice', calcTotal.toString());
    
    console.log('✓ SAVED TO LOCALSTORAGE:', {
      selectedOptions,
      finalPrice: calcTotal
    });

    // Navigate to contact section
    onContact();
  };

  return (
    <section id="pricing" className="py-32 transition-colors duration-500" style={{ backgroundColor: 'var(--section-bg)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
           <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">Build Your Quote</h2>
           <p className="text-[var(--text-secondary)]">Select the features you need for a precise estimate.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          <div className="flex-1 surface-card p-8 rounded-3xl">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]"><Layers className="text-[var(--accent-primary)]"/> Add-ons & Features</h3>
             <div className="space-y-4">
                {featuresList.map((item) => {
                  const isSelected = calcFeatures.includes(item.id);
                  const featureStyles = {
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                    background: isSelected ? 'rgba(30, 144, 255, 0.12)' : undefined,
                  };

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleFeature(item.price, item.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                        isSelected ? '' : 'bg-[var(--surface-muted)] hover:bg-[var(--surface-primary)]'
                      }`}
                      style={featureStyles}
                    >
                     <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]' : 'border-[var(--border-color)]'}`}>
                         {isSelected && (
                           <svg width="12" height="12" viewBox="0 0 24 24">
                             <path fill="white" d="M20 6L9 17l-5-5" />
                           </svg>
                         )}
                       </div>
                       <span className={isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)]'}>{item.name}</span>
                     </div>
                     <span className="text-sm font-mono text-[var(--text-secondary)]">+{item.price} DH</span>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="lg:w-1/3">
             <div className="sticky top-32 rounded-3xl p-8 text-white relative overflow-hidden shadow-[var(--glow-primary)]" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <h3 className="text-lg font-bold opacity-80 mb-2 relative">Estimated Total</h3>
                <div className="text-5xl font-bold mb-6 relative">{calcTotal} <span className="text-xl">DH</span></div>

                <div className="space-y-2 mb-8 relative text-sm opacity-80 border-t border-white/20 pt-4">
                  <div className="flex justify-between"><span>Base Package</span><span>2000 DH</span></div>
                  {calcFeatures.map(fid => {
                     const f = featuresList.find(i => i.id === fid);
                     return <div key={fid} className="flex justify-between"><span>{f.name}</span><span>+{f.price} DH</span></div>;
                  })}
                </div>

                <div className="flex items-center justify-between text-xs bg-black/20 p-3 rounded-lg mb-6 relative">
                  <span>Est. Delivery</span>
                  <span className="font-bold text-yellow-400">{calcFeatures.length > 3 ? '10-14 Days' : '5-7 Days'}</span>
                </div>

                <Button onClick={handleStartProject} variant="primary" className="w-full relative">Start Project</Button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;
