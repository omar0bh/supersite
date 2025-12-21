import React from 'react';
import { Code2, Database, Globe, Smartphone, Zap } from 'lucide-react';

const TechnologyStack = () => {
  const technologies = [
    { name: 'React', icon: <Code2 size={32} />, category: 'Frontend' },
    { name: 'Next.js', icon: <Zap size={32} />, category: 'Framework' },
    { name: 'Node.js', icon: <Database size={32} />, category: 'Backend' },
    { name: 'MongoDB', icon: <Database size={32} />, category: 'Database' },
    { name: 'PostgreSQL', icon: <Database size={32} />, category: 'Database' },
    { name: 'TypeScript', icon: <Code2 size={32} />, category: 'Language' },
    { name: 'Tailwind CSS', icon: <Globe size={32} />, category: 'Styling' },
    { name: 'Express.js', icon: <Code2 size={32} />, category: 'Backend' },
    { name: 'Vue.js', icon: <Code2 size={32} />, category: 'Frontend' },
    { name: 'Angular', icon: <Code2 size={32} />, category: 'Frontend' },
    { name: 'Python', icon: <Code2 size={32} />, category: 'Language' },
    { name: 'Django', icon: <Code2 size={32} />, category: 'Framework' },
    { name: 'Flask', icon: <Code2 size={32} />, category: 'Framework' },
    { name: 'Firebase', icon: <Database size={32} />, category: 'Backend' },
    { name: 'AWS', icon: <Globe size={32} />, category: 'Cloud' },
    { name: 'Docker', icon: <Code2 size={32} />, category: 'DevOps' },
    { name: 'GraphQL', icon: <Code2 size={32} />, category: 'API' },
    { name: 'REST API', icon: <Code2 size={32} />, category: 'API' },
    { name: 'Git', icon: <Code2 size={32} />, category: 'Version Control' },
    { name: 'WordPress', icon: <Globe size={32} />, category: 'CMS' },
    { name: 'Shopify', icon: <Smartphone size={32} />, category: 'E-commerce' },
    { name: 'Stripe', icon: <Smartphone size={32} />, category: 'Payment' },
  ];

  // Duplicate the array for seamless infinite scroll
  const duplicatedTech = [...technologies, ...technologies];

  return (
    <section id="technology-stack" className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--surface-primary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Our Technology Stack
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            We leverage cutting-edge technologies to build fast, scalable, and modern websites that deliver exceptional user experiences.
          </p>
        </div>

        {/* Scrolling Animation Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-slow">
            {duplicatedTech.map((tech, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-4 group"
                style={{ minWidth: '200px' }}
              >
                <div 
                  className="rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--surface-muted)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-primary)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(30, 144, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="mb-3 transition-colors"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {tech.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{tech.name}</h3>
                    <span className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {tech.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="text-center p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--surface-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>50+</div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Technologies</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>In our toolkit</div>
          </div>
          <div 
            className="text-center p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--surface-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>100%</div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Modern Stack</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Latest frameworks</div>
          </div>
          <div 
            className="text-center p-6 rounded-xl"
            style={{
              backgroundColor: 'var(--surface-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>24/7</div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Support</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Expert maintenance</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-slow {
          animation: scroll-slow 60s linear infinite;
          display: flex;
          width: fit-content;
          transition: all 0.3s ease;
        }

        .animate-scroll-slow:hover {
          animation-play-state: paused;
        }

        #technology-stack {
          transition: background-color 0.5s ease, color 0.5s ease;
        }
      `}</style>
    </section>
  );
};

export default TechnologyStack;
