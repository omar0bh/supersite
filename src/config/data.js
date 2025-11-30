import { Coffee, Home, Gavel, Scissors, ShoppingBag, Monitor, Briefcase } from 'lucide-react';

export const templates = [
  { id: 1, name: 'RestoLuxe', cat: 'Restaurant', icon: Coffee, color: 'from-orange-500 to-red-500', desc: 'Digital menu & reservations.' },
  { id: 2, name: 'EstatePro', cat: 'Real Estate', icon: Home, color: 'from-blue-500 to-cyan-500', desc: 'Property listings with VR tour.' },
  { id: 3, name: 'LegalMind', cat: 'Lawyer', icon: Gavel, color: 'from-slate-500 to-slate-700', desc: 'Trust-building consulting site.' },
  { id: 4, name: 'GlowUp', cat: 'Beauty', icon: Scissors, color: 'from-pink-500 to-rose-500', desc: 'Salon booking & gallery.' },
  { id: 5, name: 'ShopifyPlus', cat: 'E-Commerce', icon: ShoppingBag, color: 'from-emerald-500 to-teal-500', desc: 'High-conversion store.' },
  { id: 6, name: 'SaaS Dasher', cat: 'Tech', icon: Monitor, color: 'from-violet-500 to-purple-500', desc: 'Modern software landing page.' },
  { id: 7, name: 'Professional', cat: 'Business', icon: Briefcase, color: 'from-gray-700 to-gray-900', desc: 'Corporate & Professional Services.' },
];

export const featuresList = [
  { id: 'cms', name: 'Admin Dashboard (CMS)', price: 1000 },
  { id: 'seo', name: 'Advanced SEO', price: 500 },
  { id: 'pay', name: 'Payment Gateway', price: 800 },
  { id: 'lang', name: 'Multi-language', price: 600 },
  { id: 'chat', name: 'AI Chatbot', price: 1200 },
  { id: 'anim', name: 'Advanced Animations', price: 400 },
];
