import React from 'react';
import { Sparkles, Eye, Bot, Zap } from 'lucide-react';
import Button from '../ui/Button';

const Hero = ({ onNavigate }) => (
  <section id="hero" className="relative flex items-center pt-24 pb-16 overflow-hidden transition-colors duration-500">
    {/* Background mesh & blurred circles */}
    <div className="absolute inset-0 hero-mesh -z-10 opacity-70"></div>
    <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-[120px] -z-10 animate-pulse" style={{ backgroundColor: 'rgba(30, 144, 255, 0.2)' }}></div>
    <div className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full blur-[140px] -z-10" style={{ backgroundColor: 'rgba(63, 224, 197, 0.2)' }}></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Text + CTA */}
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

        {/* Right Side: Video */}
        <div className="lg:w-1/2 w-full relative perspective-1000">
          <div className="relative w-full max-w-lg mx-auto float">
            
            {/* Animated Glow Background */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-30 blur-2xl animate-pulse"></div>
            
            {/* Outer Frame with Gradient Border */}
            <div className="relative rounded-3xl p-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 animate-gradient">
              <div className="rounded-3xl bg-[var(--color-bg)] overflow-hidden">
                
                {/* Video Container with Professional Frame */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl z-10"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-cyan-500 rounded-tr-3xl z-10"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-purple-500 rounded-bl-3xl z-10"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-blue-500 rounded-br-3xl z-10"></div>

                  {/* Video */}
                  <video
                    src={`${process.env.PUBLIC_URL}/vedio1.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full block"
                    style={{ display: 'block', height: 'auto' }}
                    onError={(e) => {
                      console.error('Video failed to load:', e);
                      e.target.style.display = 'none';
                    }}
                  >
                    <source src={`${process.env.PUBLIC_URL}/vedio1.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>
                  
                  {/* Scan Line Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan pointer-events-none"></div>
                </div>
                
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-blue-500 animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-3 h-3 rounded-full bg-cyan-500 animate-ping delay-700"></div>
          </div>

          {/* Optional floating panels on top of video */}
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
  </section>
);

export default Hero;
