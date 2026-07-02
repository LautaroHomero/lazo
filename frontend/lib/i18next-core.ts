import i18next from 'i18next';
import { messages } from './i18n-resources';

/**
 * A plain i18next instance (no react-i18next plugin attached) safe to use
 * from React Server Components. `react-i18next`'s `initReactI18next` plugin
 * pulls in `React.createContext`, which does not exist in the RSC/server
 * runtime, so server code must never import the client-bound instance in
 * `lib/i18next.ts`. Both instances load the exact same resource bundle from
 * `i18n-resources.ts`, so translations stay identical on the server and the
 * client — only the React binding differs.
 */
const serverI18n = i18next.createInstance();

serverI18n.init({
  resources: {
    en: { translation: messages.en },
    es: { translation: messages.es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default serverI18n;
