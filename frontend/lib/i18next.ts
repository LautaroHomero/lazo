import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { messages } from "./i18n-resources";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: messages.en,
    },
    es: {
      translation: messages.es,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
