import en from '../assets/locales/en.json';
import sw from '../assets/locales/sw.json';
import tw from '../assets/locales/tw.json';

const dictionaries: Record<string, any> = {
  en,
  sw,
  tw
};

// In a real app, this might come from React Context or Zustand
let currentLanguage = 'en';

export const setLanguage = (lang: string) => {
  if (dictionaries[lang]) {
    currentLanguage = lang;
  }
};

export const t = (key: string): string => {
  const dict = dictionaries[currentLanguage] || dictionaries['en'];
  const value = key.split('.').reduce((obj, k) => (obj || {})[k], dict);
  return value || key;
};
