import React from 'react';
import { Sparkles, Eye, Bot, Zap } from 'lucide-react';
import Button from '../ui/Button';

const Hero = ({ onNavigate }) => (
  <section id="hero" className="relative min-h-screen flex items-center pt-24 overflow-hidden transition-colors duration-500">
    <div className="absolute inset-0 hero-mesh -z-10 opacity-70"></div>
    <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-[120px] -z-10 animate-pulse" style={{ backgroundColor: 'rgba(30, 144, 255, 0.2)' }}></div>
    <div className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full blur-[140px] -z-10" style={{ backgroundColor: 'rgba(63, 224, 197, 0.2)' }}></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full pill text-xs font-bold uppercase tracking-widest mb-6 text-[var(--accent-primary)]">
            <Sparkles size={12} /> AI-Powered Web Agency
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)]">
            Web Design <br/> from the <span className="neon-text text-[var(--accent-primary)]">Future.</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            We build cinematic, high-performance websites infused with Artificial Intelligence. Stop competing. Start dominating.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button onClick={() => onNavigate('demos')} variant="primary" icon={Eye}>View Demos</Button>
            <Button onClick={() => onNavigate('ai-tools')} variant="magic" icon={Bot}>Try AI Tools</Button>
          </div>
        </div>

        <div className="lg:w-1/2 w-full relative perspective-1000">
          <div className="relative w-full aspect-square max-w-lg mx-auto float">
            <div className="absolute inset-0 surface-card rounded-3xl flex flex-col overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-all duration-700">
               <div className="h-12 surface-muted flex items-center px-6 gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
               </div>
               <div className="flex-1 p-8 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                 <div className="w-3/4 h-8 bg-[var(--surface-muted)] rounded-lg mb-4 animate-pulse"></div>
                 <div className="w-1/2 h-8 bg-[var(--surface-muted)] rounded-lg mb-12 animate-pulse delay-100"></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="h-32 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'rgba(30,144,255,0.08)' }}></div>
                   <div className="h-32 rounded-xl border" style={{ borderColor: 'var(--border-color)', background: 'rgba(63,224,197,0.12)' }}></div>
                 </div>
               </div>
            </div>

            <div className="absolute -right-8 top-20 p-4 glass-panel rounded-2xl animate-bounce delay-700">
              <div className="flex items-center gap-3">
                <div className="icon-bubble text-[var(--accent-secondary)] p-2 rounded-lg"><Zap size={20}/></div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)]">Performance</div>
                  <div className="font-bold text-[var(--text-primary)]">99/100</div>
                </div>
              </div>
            </div>

            <div className="absolute -left-8 bottom-20 p-4 glass-panel rounded-2xl animate-bounce delay-300">
              <div className="flex items-center gap-3">
                <div className="icon-bubble text-[var(--accent-primary)] p-2 rounded-lg"><Bot size={20}/></div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)]">AI Integration</div>
                  <div className="font-bold text-[var(--text-primary)]">Active</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
);

export default Hero;
