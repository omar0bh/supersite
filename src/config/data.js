import { Coffee, Home, Heart, ShoppingBag, Monitor, Briefcase } from 'lucide-react';

export const templates = [
  {
    id: 1,
    name: 'RestoLuxe',
    cat: 'Restaurant',
    icon: Coffee,
    image: '/restoluxe.png',
    color: 'from-orange-500 to-red-500',
    desc: 'Digital menu & reservations.',
    //subDemos: [
    //  { id: 'r1', name: 'Oven Restaurant', url: 'https://ovenrestaurantlaayoune.com/', image: '/restoluxe.png' },
    //]
  },
  {
    id: 2,
    name: 'EstatePro',
    cat: 'Real Estate',
    icon: Home,
    color: 'from-blue-500 to-cyan-500',
    desc: 'Property listings with VR tour.',
    image: '/estatpro.png',
    //subDemos: [
    //  { id: 'e1', name: 'EstatePro', url: 'https://www.realtor.com/', image: '/estatpro.png' },
    //]
  },
  {
    id: 3,
    name: 'Medicine',
    cat: 'Health',
    icon: Heart,
    image: '/medicine.png',
    color: 'from-pink-500 to-rose-500',
    desc: 'Salon booking & gallery.'
  },
  {
    id: 4,
    name: 'ShopifyPlus',
    cat: 'E-Commerce',
    icon: ShoppingBag,
    image: '/shopifyplus.png',
    color: 'from-emerald-500 to-teal-500',
    desc: 'High-conversion store.'
  },
  {
    id: 5,
    name: 'SaaS Dasher',
    cat: 'Tech',
    icon: Monitor,
    image: '/saasdash.png',
    color: 'from-violet-500 to-purple-500',
    desc: 'Modern software landing page.'
  },
  {
    id: 6,
    name: 'Professional',
    cat: 'Business',
    icon: Briefcase,
    image: '/professional.png',
    color: 'from-gray-700 to-gray-900',
    desc: 'Corporate & Professional Services.'
  }
];

export const featuresList = [
  { id: 'cms', name: 'Admin Dashboard (CMS)', price: 1000 },
  { id: 'seo', name: 'Advanced SEO', price: 500 },
  { id: 'pay', name: 'Payment Gateway', price: 800 },
  { id: 'lang', name: 'Multi-language', price: 600 },
  { id: 'chat', name: 'AI Chatbot', price: 1200 },
  { id: 'anim', name: 'Advanced Animations', price: 400 },
];


