// UI translation dictionary for the museum kiosk.
// Content (station scripts, quiz questions, slides) is translated in the DB;
// this file covers the app chrome — nav, buttons, labels, headings.

export type Lang = "en" | "kn" | "hi";

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
  { code: "hi", label: "हिन्दी", short: "हि" },
];

// Each key maps to the three languages. Keep keys stable — components read by key.
export const STRINGS = {
  // Brand / common
  "app.title": { en: "Viveka Smaraka", kn: "ವಿವೇಕ ಸ್ಮಾರಕ", hi: "विवेक स्मारक" },
  "app.subtitle": {
    en: "Experience the life and teachings of Swami Vivekananda",
    kn: "ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಜೀವನ ಮತ್ತು ಬೋಧನೆಗಳನ್ನು ಅನುಭವಿಸಿ",
    hi: "स्वामी विवेकानंद के जीवन और शिक्षाओं का अनुभव करें",
  },
  "app.ashram": {
    en: "Ramakrishna Ashram · Mysore",
    kn: "ರಾಮಕೃಷ್ಣ ಆಶ್ರಮ · ಮೈಸೂರು",
    hi: "रामकृष्ण आश्रम · मैसूर",
  },
  "common.home": { en: "Home", kn: "ಮುಖಪುಟ", hi: "मुख्य पृष्ठ" },
  "common.back": { en: "Back", kn: "ಹಿಂದೆ", hi: "वापस" },
  "common.enter": { en: "Enter", kn: "ಪ್ರವೇಶಿಸಿ", hi: "प्रवेश करें" },
  "common.loading": { en: "Loading…", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…", hi: "लोड हो रहा है…" },
  "common.beginJourney": { en: "Begin your journey", kn: "ನಿಮ್ಮ ಪಯಣ ಆರಂಭಿಸಿ", hi: "अपनी यात्रा शुरू करें" },
  "common.close": { en: "Close", kn: "ಮುಚ್ಚಿ", hi: "बंद करें" },
  "common.retry": { en: "Try again", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", hi: "फिर से प्रयास करें" },

  // Module cards (home)
  "mod.guide.title": { en: "Audio Guide", kn: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ", hi: "ऑडियो गाइड" },
  "mod.guide.sub": {
    en: "Guided narration through the gallery",
    kn: "ಗ್ಯಾಲರಿಯ ಮೂಲಕ ಮಾರ್ಗದರ್ಶಿತ ನಿರೂಪಣೆ",
    hi: "गैलरी के माध्यम से निर्देशित वर्णन",
  },
  "mod.gallery.title": { en: "Exhibit Gallery", kn: "ಪ್ರದರ್ಶನ ಗ್ಯಾಲರಿ", hi: "प्रदर्शनी गैलरी" },
  "mod.gallery.sub": {
    en: "Visual journey through Swamiji's life",
    kn: "ಸ್ವಾಮೀಜಿಯ ಜೀವನದ ದೃಶ್ಯ ಪಯಣ",
    hi: "स्वामीजी के जीवन की दृश्य यात्रा",
  },
  "mod.chat.title": { en: "Speak with Swamiji", kn: "ಸ್ವಾಮೀಜಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ", hi: "स्वामीजी से बात करें" },
  "mod.chat.sub": {
    en: "AI-guided wisdom from his teachings",
    kn: "ಅವರ ಬೋಧನೆಗಳಿಂದ AI-ಮಾರ್ಗದರ್ಶಿತ ಜ್ಞಾನ",
    hi: "उनकी शिक्षाओं से AI-निर्देशित ज्ञान",
  },
  "mod.quiz.title": { en: "Knowledge Quiz", kn: "ಜ್ಞಾನ ರಸಪ್ರಶ್ನೆ", hi: "ज्ञान प्रश्नोत्तरी" },
  "mod.quiz.sub": {
    en: "Test your understanding, earn a certificate",
    kn: "ನಿಮ್ಮ ತಿಳಿವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ, ಪ್ರಮಾಣಪತ್ರ ಗಳಿಸಿ",
    hi: "अपनी समझ परखें, प्रमाणपत्र प्राप्त करें",
  },
  "mod.timeline.title": { en: "Life Journey", kn: "ಜೀವನ ಪಯಣ", hi: "जीवन यात्रा" },
  "mod.timeline.sub": {
    en: "An illustrated timeline, 1863–1902",
    kn: "ಚಿತ್ರಿತ ಕಾಲರೇಖೆ, ೧೮೬೩–೧೯೦೨",
    hi: "एक सचित्र कालक्रम, 1863–1902",
  },
  "mod.map.title": { en: "World Travels", kn: "ವಿಶ್ವ ಪ್ರವಾಸ", hi: "विश्व यात्राएँ" },
  "mod.map.sub": {
    en: "433 places across five continents, 1863–1902",
    kn: "ಐದು ಖಂಡಗಳಲ್ಲಿ ೪೩೩ ಸ್ಥಳಗಳು, ೧೮೬೩–೧೯೦೨",
    hi: "पाँच महाद्वीपों में 433 स्थान, 1863–1902",
  },
  "mod.centres.title": { en: "RKM Centres", kn: "ರಾಮಕೃಷ್ಣ ಕೇಂದ್ರಗಳು", hi: "रामकृष्ण केंद्र" },
  "mod.centres.sub": {
    en: "323 centres of Ramakrishna Math & Mission worldwide",
    kn: "ವಿಶ್ವದಾದ್ಯಂತ ರಾಮಕೃಷ್ಣ ಮಠ ಮತ್ತು ಮಿಷನ್‌ನ ೩೨೩ ಕೇಂದ್ರಗಳು",
    hi: "विश्वभर में रामकृष्ण मठ एवं मिशन के 323 केंद्र",
  },

  // Guide
  "guide.selectLanguage": { en: "Select language", kn: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", hi: "भाषा चुनें" },
  "guide.allZones": { en: "All Zones", kn: "ಎಲ್ಲಾ ವಲಯಗಳು", hi: "सभी क्षेत्र" },
  "guide.stationsAvailable": { en: "stations available", kn: "ನಿಲ್ದಾಣಗಳು ಲಭ್ಯ", hi: "स्टेशन उपलब्ध" },
  "guide.tapToListen": { en: "Tap a station to listen", kn: "ಕೇಳಲು ನಿಲ್ದಾಣ ಒತ್ತಿ", hi: "सुनने के लिए स्टेशन दबाएँ" },
  "guide.allStations": { en: "All Stations", kn: "ಎಲ್ಲಾ ನಿಲ್ದಾಣಗಳು", hi: "सभी स्टेशन" },
  "guide.pressPlay": { en: "Press play to begin the narration", kn: "ನಿರೂಪಣೆ ಆರಂಭಿಸಲು ಪ್ಲೇ ಒತ್ತಿ", hi: "वर्णन शुरू करने के लिए प्ले दबाएँ" },

  // Gallery
  "gallery.selectTopic": { en: "Select a topic to explore", kn: "ಅನ್ವೇಷಿಸಲು ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ", hi: "अन्वेषण के लिए विषय चुनें" },
  "gallery.slides": { en: "slides", kn: "ಸ್ಲೈಡ್‌ಗಳು", hi: "स्लाइड" },
  "gallery.lectures": { en: "lectures", kn: "ಉಪನ್ಯಾಸಗಳು", hi: "व्याख्यान" },
  "gallery.none": { en: "No exhibits available yet", kn: "ಇನ್ನೂ ಪ್ರದರ್ಶನಗಳಿಲ್ಲ", hi: "अभी कोई प्रदर्शनी उपलब्ध नहीं" },

  // Quiz
  "quiz.title": { en: "Knowledge Quiz", kn: "ಜ್ಞಾನ ರಸಪ್ರಶ್ನೆ", hi: "ज्ञान प्रश्नोत्तरी" },
  "quiz.testUnderstanding": { en: "Test your understanding", kn: "ನಿಮ್ಮ ತಿಳಿವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ", hi: "अपनी समझ परखें" },
  "quiz.startQuiz": { en: "Start quiz", kn: "ರಸಪ್ರಶ್ನೆ ಆರಂಭಿಸಿ", hi: "प्रश्नोत्तरी शुरू करें" },
  "quiz.begin": { en: "Begin the quiz", kn: "ರಸಪ್ರಶ್ನೆ ಆರಂಭಿಸಿ", hi: "प्रश्नोत्तरी आरंभ करें" },
  "quiz.minutes": { en: "Minutes", kn: "ನಿಮಿಷಗಳು", hi: "मिनट" },
  "quiz.questions": { en: "Questions", kn: "ಪ್ರಶ್ನೆಗಳು", hi: "प्रश्न" },
  "quiz.toPass": { en: "To Pass", kn: "ಉತ್ತೀರ್ಣಕ್ಕೆ", hi: "उत्तीर्ण हेतु" },
  "quiz.earnCertificate": { en: "Earn a certificate", kn: "ಪ್ರಮಾಣಪತ್ರ ಗಳಿಸಿ", hi: "प्रमाणपत्र प्राप्त करें" },
  "quiz.enterName": { en: "Enter your name for the certificate", kn: "ಪ್ರಮಾಣಪತ್ರಕ್ಕಾಗಿ ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ", hi: "प्रमाणपत्र के लिए अपना नाम दर्ज करें" },
  "quiz.next": { en: "Next", kn: "ಮುಂದೆ", hi: "आगे" },
  "quiz.previous": { en: "Previous", kn: "ಹಿಂದೆ", hi: "पिछला" },
  "quiz.submit": { en: "Submit", kn: "ಸಲ್ಲಿಸಿ", hi: "जमा करें" },
  "quiz.passed": { en: "Passed", kn: "ಉತ್ತೀರ್ಣ", hi: "उत्तीर्ण" },
  "quiz.downloadCertificate": { en: "Download certificate", kn: "ಪ್ರಮಾಣಪತ್ರ ಡೌನ್‌ಲೋಡ್", hi: "प्रमाणपत्र डाउनलोड करें" },

  // Attract mode
  "attract.tapToBegin": { en: "Touch anywhere to begin", kn: "ಆರಂಭಿಸಲು ಎಲ್ಲಿಯಾದರೂ ಸ್ಪರ್ಶಿಸಿ", hi: "शुरू करने के लिए कहीं भी स्पर्श करें" },

  // Errors
  "error.title": { en: "Something went wrong", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ", hi: "कुछ गलत हो गया" },
  "error.body": {
    en: "This screen hit a snag. Return home and try again.",
    kn: "ಈ ಪರದೆಯಲ್ಲಿ ಸಮಸ್ಯೆ ಉಂಟಾಯಿತು. ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    hi: "इस स्क्रीन में समस्या आई। मुख्य पृष्ठ पर लौटें और पुनः प्रयास करें।",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
