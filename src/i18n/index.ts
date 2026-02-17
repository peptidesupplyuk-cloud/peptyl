import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";

// Detect language from hostname (for domain-based routing)
const domainLanguageMap: Record<string, string> = {
  "peptyl.de": "de",
  "www.peptyl.de": "de",
  "peptyl.fr": "fr",
  "www.peptyl.fr": "fr",
};

const detectLanguageFromDomain = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return domainLanguageMap[window.location.hostname];
};

const domainLang = detectLanguageFromDomain();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
    },
    lng: domainLang, // override with domain detection if available
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: domainLang
        ? [] // skip detection if domain already set the language
        : ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "peptyl-lang",
    },
  });

export default i18n;

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;
