export const i18n = {
  defaultLocale: "en",
  locales: ["en", "tib"],
};

export type Locale = (typeof i18n)["locales"][number];
