import serverI18n from "./i18next-core";
import { type Locale, messages } from "./i18n-resources";

export type { Locale };
export { messages };

type Translations = typeof messages.en;

/**
 * Returns the translation strings for a given locale.
 *
 * Every lookup is routed through a server-safe i18next instance
 * (`serverI18n.getFixedT`), so Server Components (which can't use the
 * `useTranslation` hook) stay backed by i18next just like client
 * components, instead of a parallel plain-object dictionary.
 */
export function getTranslations(locale: Locale): Translations {
  const t = serverI18n.getFixedT(locale);

  return new Proxy({} as Translations, {
    get(_target, prop) {
      if (typeof prop !== "string") {
        return undefined;
      }
      return t(prop);
    },
  });
}
