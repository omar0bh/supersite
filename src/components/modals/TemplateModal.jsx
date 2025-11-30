import React from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

const TemplateModal = ({ template, onClose }) => {
  if (!template) return null;

  const Icon = template.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
       <div className="surface-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col h-[80vh]">
         
         {/* Header */}
         <div className="p-6 border-b flex justify-between items-center surface-muted" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color} text-white`}>
                 {Icon && typeof Icon === 'function' ? <Icon size={20} /> : null}
               </div>
               <div>
                 <h3 className="font-bold text-[var(--text-primary)]">{template.name} Demo</h3>
                 <p className="text-xs text-[var(--text-secondary)]">Premium Template</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--surface-primary)] rounded-full transition-colors">
              <X />
            </button>
         </div>

         {/* Body */}
         <div className="flex-1 flex items-center justify-center relative overflow-hidden surface-muted">
            <div className="text-center">
               <p className="text-[var(--text-secondary)] mb-4">Live Preview Loading...</p>
               <div className="w-16 h-16 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--surface-muted)] to-transparent h-32"></div>
         </div>

         {/* Footer */}
         <div className="p-6 border-t flex justify-end gap-4 surface-card" style={{ borderColor: 'var(--border-color)' }}>
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Close
            </button>
            <Button variant="neon" className="py-3 px-8 text-sm">Select This Template</Button>
         </div>

       </div>
    </div>
  );
};

export default TemplateModal;
