import React from 'react';
import { ArrowRight } from 'lucide-react';

const CaseStudies = () => (
  <section id="case-studies" className="py-32 relative overflow-hidden" style={{ backgroundColor: 'var(--section-bg)' }}>
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-end justify-between mb-12">
         <div>
           <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">Real Results. <span className="text-[var(--accent-primary)]">Real ROI.</span></h2>
           <p className="text-[var(--text-secondary)]">We don't just design. We improve metrics.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="glass-panel p-8 rounded-3xl transition-all group hover:shadow-[0_25px_60px_rgba(30,144,255,0.2)]">
           <div className="flex justify-between items-start mb-8">
             <div className="px-3 py-1 rounded-full text-xs font-bold uppercase pill text-[var(--accent-primary)] border border-transparent">Case Study #1</div>
             <ArrowRight className="group-hover:translate-x-2 transition-transform" />
           </div>
           <h3 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Hotel Marrakech Luxe</h3>
           <p className="text-[var(--text-secondary)] mb-8">The client needed a direct booking engine to reduce dependency on Booking.com commissions.</p>

           <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-secondary)]">+45%</div><div className="text-xs text-[var(--text-secondary)]">Bookings</div></div>
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-primary)]">0.4s</div><div className="text-xs text-[var(--text-secondary)]">Load Time</div></div>
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-primary)]">#1</div><div className="text-xs text-[var(--text-secondary)]">Rank</div></div>
           </div>
         </div>

         <div className="glass-panel p-8 rounded-3xl transition-all group hover:shadow-[0_25px_60px_rgba(63,224,197,0.2)]">
           <div className="flex justify-between items-start mb-8">
             <div className="px-3 py-1 rounded-full text-xs font-bold uppercase pill text-[var(--accent-secondary)] border border-transparent">Case Study #2</div>
             <ArrowRight className="group-hover:translate-x-2 transition-transform" />
           </div>
           <h3 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Atlas E-Commerce</h3>
           <p className="text-[var(--text-secondary)] mb-8">Migrating a slow WordPress store to a custom Next.js solution with AI recommendations.</p>

           <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-secondary)]">3x</div><div className="text-xs text-[var(--text-secondary)]">Sales</div></div>
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-primary)]">99</div><div className="text-xs text-[var(--text-secondary)]">SEO</div></div>
             <div className="surface-muted p-4 rounded-xl text-center"><div className="text-2xl font-bold text-[var(--accent-primary)]">AI</div><div className="text-xs text-[var(--text-secondary)]">Features</div></div>
           </div>
         </div>
      </div>
    </div>
  </section>
);

export default CaseStudies;
