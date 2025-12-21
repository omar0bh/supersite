import React from 'react';
import { Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { templates } from '../../config/data';

const TemplateStore = ({ onSelectTemplate }) => (
  <section id="demos" className="py-32 relative bg-[var(--section-bg)] transition-colors duration-500">
    <div className="container mx-auto px-6">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">Pre-Built <span className="text-[var(--accent-primary)]">Masterpieces</span></h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Don't start from scratch. Choose a premium industry template and we'll customize it to perfection in 48 hours.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {templates.map((temp) => {
          const Icon = temp.icon;
          return (
            <div key={temp.id} className="group relative gradient-border cursor-pointer" onClick={() => onSelectTemplate(temp)}>
              <div className="surface-muted p-1 rounded-2xl h-full">
                <div className="surface-card rounded-xl overflow-hidden relative h-64">
                  {temp.image ? (
                    <>
                      <img
                        src={process.env.PUBLIC_URL + temp.image}
                        alt={temp.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${temp.color} opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                    <button className="bg-[var(--accent-primary)] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-[var(--glow-primary)]">
                      <Eye size={18} /> Preview Demo
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass-panel p-3 rounded-lg flex items-center gap-3">
                      <div className={`p-2 rounded-md bg-gradient-to-br ${temp.color} text-white shadow-lg`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)]">{temp.name}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">{temp.cat}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default TemplateStore;
