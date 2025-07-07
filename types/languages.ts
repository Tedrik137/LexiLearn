export type LanguageCode = "en-AU" | "ar-XA" | "fr-FR" | "ja-JP";
export type Language = { id: number; name: string; code: LanguageCode };
export type LanguageProperties = {
  direction: "ltr" | "rtl";
  isIsolated: boolean;
};
export type Languages = Language[];
