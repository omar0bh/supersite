// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../config/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'FR';
    return localStorage.getItem('devsite-lang') || 'FR';
  });

  const setLanguage = (lang) => {
    if (lang === 'FR' || lang === 'EN') {
      setLanguageState(lang);
      localStorage.setItem('devsite-lang', lang);
    }
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let result = translations[language];
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English if not found in current language
        let fallback = translations['EN'];
        for (const fkey of keys) {
          if (fallback && fallback[fkey] !== undefined) {
            fallback = fallback[fkey];
          } else {
            fallback = null;
            break;
          }
        }
        if (fallback) return fallback;
        
        console.warn(`Translation key not found: ${keyPath}`);
        return keyPath;
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
