export type LanguageCode = "en"; // Add more as needed

export type SoundFiles = {
  [key in LanguageCode]: {
    [letter: string]: any; // `any` is used because `require()` returns a module object
  };
};
