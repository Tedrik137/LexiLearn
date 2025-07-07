import { LanguageCode, LanguageProperties } from "@/types/languages";

export const localizedLanguageProperties: Record<
  LanguageCode,
  LanguageProperties
> = {
  "en-AU": {
    direction: "ltr",
    isIsolated: false,
  },
  "fr-FR": {
    direction: "ltr",
    isIsolated: false,
  },
  "ar-XA": {
    direction: "rtl",
    isIsolated: true,
  },
  "ja-JP": {
    direction: "ltr",
    isIsolated: false,
  },
};
