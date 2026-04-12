'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    settings: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    currency: 'Currency',
    exportData: 'Export Data',
    appInfo: 'App Info',
    logout: 'Logout',
    version: 'Version',
    support: 'Support',
    exportCsv: 'Download Transactions CSV'
  },
  hi: {
    settings: 'सेटिंग्स',
    appearance: 'रूप',
    language: 'भाषा',
    currency: 'मुद्रा',
    exportData: 'डेटा एक्सपोर्ट',
    appInfo: 'ऐप जानकारी',
    logout: 'लॉगआउट',
    version: 'संस्करण',
    support: 'सहायता',
    exportCsv: 'CSV डाउनलोड करें'
  },
  ta: {
    settings: 'அமைப்புகள்',
    appearance: 'தீம்',
    language: 'மொழி',
    currency: 'நாணயம்',
    exportData: 'தரவு ஏற்றுமதி',
    appInfo: 'பயன்பாட்டு தகவல்',
    logout: 'வெளியேறு',
    version: 'பதிப்பு',
    support: 'ஆதரவு',
    exportCsv: 'CSV பதிவிறக்கு'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('appLanguage');
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const t = (key) =>
    translations[language]?.[key] || key;

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () =>
  useContext(LanguageContext);