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
  "common.returnHome": { en: "Return Home", kn: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ", hi: "मुख्य पृष्ठ पर लौटें" },
  "common.yourName": { en: "Your name", kn: "ನಿಮ್ಮ ಹೆಸರು", hi: "आपका नाम" },
  "common.agePlaceholder": { en: "Your age (optional)", kn: "ನಿಮ್ಮ ವಯಸ್ಸು (ಐಚ್ಛಿಕ)", hi: "आपकी आयु (वैकल्पिक)" },
  "common.listening": { en: "Listening…", kn: "ಆಲಿಸುತ್ತಿದೆ…", hi: "सुन रहे हैं…" },

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
  "mod.letters.title": { en: "Letters", kn: "ಪತ್ರಗಳು", hi: "पत्र" },
  "mod.letters.sub": {
    en: "Swamiji's letters, in his own words",
    kn: "ಸ್ವಾಮೀಜಿಯ ಪತ್ರಗಳು, ಅವರದೇ ಮಾತುಗಳಲ್ಲಿ",
    hi: "स्वामीजी के पत्र, उन्हीं के शब्दों में",
  },

  // Guide
  "guide.selectLanguage": { en: "Select language", kn: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ", hi: "भाषा चुनें" },
  "guide.allZones": { en: "All Zones", kn: "ಎಲ್ಲಾ ವಲಯಗಳು", hi: "सभी क्षेत्र" },
  "guide.stationsAvailable": { en: "stations available", kn: "ನಿಲ್ದಾಣಗಳು ಲಭ್ಯ", hi: "स्टेशन उपलब्ध" },
  "guide.tapToListen": { en: "Tap a station to listen", kn: "ಕೇಳಲು ನಿಲ್ದಾಣ ಒತ್ತಿ", hi: "सुनने के लिए स्टेशन दबाएँ" },
  "guide.allStations": { en: "All Stations", kn: "ಎಲ್ಲಾ ನಿಲ್ದಾಣಗಳು", hi: "सभी स्टेशन" },
  "guide.pressPlay": { en: "Press play to begin the narration", kn: "ನಿರೂಪಣೆ ಆರಂಭಿಸಲು ಪ್ಲೇ ಒತ್ತಿ", hi: "वर्णन शुरू करने के लिए प्ले दबाएँ" },
  "guide.narrationSub": {
    en: "Guided narration through the gallery, station by station",
    kn: "ಗ್ಯಾಲರಿಯ ಮೂಲಕ ನಿಲ್ದಾಣದಿಂದ ನಿಲ್ದಾಣಕ್ಕೆ ಮಾರ್ಗದರ್ಶಿತ ನಿರೂಪಣೆ",
    hi: "गैलरी में स्टेशन-दर-स्टेशन निर्देशित वर्णन",
  },
  "guide.loading": { en: "Loading guide…", kn: "ಮಾರ್ಗದರ್ಶಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…", hi: "गाइड लोड हो रहा है…" },
  "guide.loadError": {
    en: "Could not load stations. Please try again.",
    kn: "ನಿಲ್ದಾಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    hi: "स्टेशन लोड नहीं हो सके। कृपया पुनः प्रयास करें।",
  },
  "guide.noStationsTitle": { en: "No Stations Yet", kn: "ಇನ್ನೂ ನಿಲ್ದಾಣಗಳಿಲ್ಲ", hi: "अभी कोई स्टेशन नहीं" },
  "guide.noStationsBody": {
    en: "The audio guide content is being prepared. Please check back soon.",
    kn: "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ವಿಷಯ ಸಿದ್ಧವಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.",
    hi: "ऑडियो गाइड सामग्री तैयार की जा रही है। कृपया शीघ्र पुनः देखें।",
  },
  "guide.station": { en: "Station", kn: "ನಿಲ್ದಾಣ", hi: "स्टेशन" },
  "guide.stations": { en: "Stations", kn: "ನಿಲ್ದಾಣಗಳು", hi: "स्टेशन" },
  "guide.loadingStation": { en: "Loading station…", kn: "ನಿಲ್ದಾಣ ಲೋಡ್ ಆಗುತ್ತಿದೆ…", hi: "स्टेशन लोड हो रहा है…" },
  "guide.stationNotFound": { en: "Station Not Found", kn: "ನಿಲ್ದಾಣ ಕಂಡುಬಂದಿಲ್ಲ", hi: "स्टेशन नहीं मिला" },
  "guide.stationNotExist": { en: "This station does not exist.", kn: "ಈ ನಿಲ್ದಾಣ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ.", hi: "यह स्टेशन मौजूद नहीं है।" },
  "guide.backToGuide": { en: "Back to Guide", kn: "ಮಾರ್ಗದರ್ಶಿಗೆ ಹಿಂತಿರುಗಿ", hi: "गाइड पर वापस" },
  "guide.mainHall": { en: "Main Hall", kn: "ಮುಖ್ಯ ಸಭಾಂಗಣ", hi: "मुख्य कक्ष" },
  "guide.galleryLabel": { en: "Gallery", kn: "ಗ್ಯಾಲರಿ", hi: "गैलरी" },
  "guide.spokenNarration": { en: "Spoken Narration", kn: "ಮಾತಿನ ನಿರೂಪಣೆ", hi: "मौखिक वर्णन" },
  "guide.tapToHear": { en: "Tap to hear the description", kn: "ವಿವರಣೆ ಕೇಳಲು ಒತ್ತಿ", hi: "विवरण सुनने के लिए दबाएँ" },
  "guide.prevStation": { en: "Previous station", kn: "ಹಿಂದಿನ ನಿಲ್ದಾಣ", hi: "पिछला स्टेशन" },
  "guide.nextStation": { en: "Next station", kn: "ಮುಂದಿನ ನಿಲ್ದಾಣ", hi: "अगला स्टेशन" },

  // Gallery
  "gallery.selectTopic": { en: "Select a topic to explore", kn: "ಅನ್ವೇಷಿಸಲು ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ", hi: "अन्वेषण के लिए विषय चुनें" },
  "gallery.slides": { en: "slides", kn: "ಸ್ಲೈಡ್‌ಗಳು", hi: "स्लाइड" },
  "gallery.lectures": { en: "lectures", kn: "ಉಪನ್ಯಾಸಗಳು", hi: "व्याख्यान" },
  "gallery.none": { en: "No exhibits available yet", kn: "ಇನ್ನೂ ಪ್ರದರ್ಶನಗಳಿಲ್ಲ", hi: "अभी कोई प्रदर्शनी उपलब्ध नहीं" },
  "gallery.selectLecture": { en: "Select a lecture to begin", kn: "ಆರಂಭಿಸಲು ಉಪನ್ಯಾಸ ಆಯ್ಕೆಮಾಡಿ", hi: "आरंभ करने के लिए व्याख्यान चुनें" },
  "gallery.subHeading": {
    en: "A visual journey through Swamiji's life and teachings",
    kn: "ಸ್ವಾಮೀಜಿಯ ಜೀವನ ಮತ್ತು ಬೋಧನೆಗಳ ದೃಶ್ಯ ಪಯಣ",
    hi: "स्वामीजी के जीवन और शिक्षाओं की दृश्य यात्रा",
  },
  "gallery.allTopics": { en: "All Topics", kn: "ಎಲ್ಲಾ ವಿಷಯಗಳು", hi: "सभी विषय" },
  "gallery.beingPrepared": { en: "Content is being prepared", kn: "ವಿಷಯ ಸಿದ್ಧವಾಗುತ್ತಿದೆ", hi: "सामग्री तैयार की जा रही है" },

  // Letters
  "letters.subHeading": {
    en: "Read Swamiji's letters as he wrote them",
    kn: "ಸ್ವಾಮೀಜಿಯ ಪತ್ರಗಳನ್ನು ಅವರು ಬರೆದಂತೆಯೇ ಓದಿ",
    hi: "स्वामीजी के पत्र, जैसे उन्होंने लिखे",
  },
  "letters.selectHeading": { en: "Select a heading to explore", kn: "ಅನ್ವೇಷಿಸಲು ಶೀರ್ಷಿಕೆ ಆಯ್ಕೆಮಾಡಿ", hi: "अन्वेषण के लिए शीर्षक चुनें" },
  "letters.selectLetter": { en: "Select a letter to read", kn: "ಓದಲು ಪತ್ರ ಆಯ್ಕೆಮಾಡಿ", hi: "पढ़ने के लिए पत्र चुनें" },
  "letters.count": { en: "letters", kn: "ಪತ್ರಗಳು", hi: "पत्र" },
  "letters.headingsCount": { en: "headings", kn: "ಶೀರ್ಷಿಕೆಗಳು", hi: "शीर्षक" },
  "letters.allHeadings": { en: "All Headings", kn: "ಎಲ್ಲಾ ಶೀರ್ಷಿಕೆಗಳು", hi: "सभी शीर्षक" },
  "letters.none": { en: "No letters available yet", kn: "ಇನ್ನೂ ಪತ್ರಗಳಿಲ್ಲ", hi: "अभी कोई पत्र उपलब्ध नहीं" },
  "letters.beingPrepared": { en: "This collection is being prepared", kn: "ಈ ಸಂಗ್ರಹ ಸಿದ್ಧವಾಗುತ್ತಿದೆ", hi: "यह संग्रह तैयार किया जा रहा है" },
  "letters.to": { en: "To", kn: "ಗೆ", hi: "प्रति" },
  "letters.from": { en: "From", kn: "ಇವರಿಂದ", hi: "प्रेषक" },
  "letters.place": { en: "Place", kn: "ಸ್ಥಳ", hi: "स्थान" },
  "letters.date": { en: "Date", kn: "ದಿನಾಂಕ", hi: "दिनांक" },

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
  "quiz.introBlurb": {
    en: "How well do you know the life and teachings of Swami Vivekananda? Take the quiz and earn a certificate.",
    kn: "ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಜೀವನ ಮತ್ತು ಬೋಧನೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಎಷ್ಟು ತಿಳಿದಿದೆ? ರಸಪ್ರಶ್ನೆ ಎದುರಿಸಿ ಪ್ರಮಾಣಪತ್ರ ಗಳಿಸಿ.",
    hi: "स्वामी विवेकानंद के जीवन और शिक्षाओं को आप कितना जानते हैं? प्रश्नोत्तरी दें और प्रमाणपत्र प्राप्त करें।",
  },
  "quiz.introSubtitle": {
    en: "Test your understanding of Swami Vivekananda's life and teachings.",
    kn: "ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಜೀವನ ಮತ್ತು ಬೋಧನೆಗಳ ಕುರಿತ ನಿಮ್ಮ ತಿಳಿವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ.",
    hi: "स्वामी विवेकानंद के जीवन और शिक्षाओं की अपनी समझ परखें।",
  },
  "quiz.noQuizzes": { en: "No quizzes available yet", kn: "ಇನ್ನೂ ರಸಪ್ರಶ್ನೆಗಳಿಲ್ಲ", hi: "अभी कोई प्रश्नोत्तरी उपलब्ध नहीं" },
  "quiz.createInAdmin": { en: "Create quizzes in Admin", kn: "ಆಡ್ಮಿನ್‌ನಲ್ಲಿ ರಸಪ್ರಶ್ನೆ ರಚಿಸಿ", hi: "एडमिन में प्रश्नोत्तरी बनाएँ" },
  "quiz.reassurance": {
    en: "Answer at your own pace — review each question before submitting.",
    kn: "ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಉತ್ತರಿಸಿ — ಸಲ್ಲಿಸುವ ಮೊದಲು ಪ್ರತಿ ಪ್ರಶ್ನೆ ಪರಿಶೀಲಿಸಿ.",
    hi: "अपनी गति से उत्तर दें — जमा करने से पहले हर प्रश्न की समीक्षा करें।",
  },
  "quiz.question": { en: "Question", kn: "ಪ್ರಶ್ನೆ", hi: "प्रश्न" },
  "quiz.exitConfirm": {
    en: "Leave the quiz now? Your progress will be lost.",
    kn: "ಈಗ ರಸಪ್ರಶ್ನೆಯಿಂದ ನಿರ್ಗಮಿಸುವುದೇ? ನಿಮ್ಮ ಪ್ರಗತಿ ಕಳೆದುಹೋಗುತ್ತದೆ.",
    hi: "क्या अभी प्रश्नोत्तरी छोड़ें? आपकी प्रगति खो जाएगी।",
  },
  "quiz.answered": { en: "answered", kn: "ಉತ್ತರಿಸಲಾಗಿದೆ", hi: "उत्तर दिए" },
  "quiz.submitting": { en: "Submitting…", kn: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ…", hi: "जमा हो रहा है…" },
  "quiz.certificateEarned": { en: "Certificate Earned", kn: "ಪ್ರಮಾಣಪತ್ರ ಗಳಿಸಲಾಗಿದೆ", hi: "प्रमाणपत्र अर्जित" },
  "quiz.quizComplete": { en: "Quiz Complete", kn: "ರಸಪ್ರಶ್ನೆ ಪೂರ್ಣಗೊಂಡಿದೆ", hi: "प्रश्नोत्तरी पूर्ण" },
  "quiz.congrats": { en: "Congratulations!", kn: "ಅಭಿನಂದನೆಗಳು!", hi: "बधाई हो!" },
  "quiz.goodEffort": { en: "Good Effort!", kn: "ಉತ್ತಮ ಪ್ರಯತ್ನ!", hi: "अच्छा प्रयास!" },
  "quiz.passedMsg": {
    en: "you have demonstrated your knowledge of Swami Vivekananda's teachings.",
    kn: "ನೀವು ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಬೋಧನೆಗಳ ಜ್ಞಾನವನ್ನು ತೋರಿಸಿದ್ದೀರಿ.",
    hi: "आपने स्वामी विवेकानंद की शिक्षाओं का अपना ज्ञान सिद्ध किया है।",
  },
  "quiz.failMsg": {
    en: "Keep learning about Swami Vivekananda's wisdom. Try again!",
    kn: "ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಜ್ಞಾನದ ಬಗ್ಗೆ ಕಲಿಯುತ್ತಿರಿ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!",
    hi: "स्वामी विवेकानंद के ज्ञान के बारे में सीखते रहें। पुनः प्रयास करें!",
  },
  "quiz.answerReview": { en: "Answer Review", kn: "ಉತ್ತರ ಪರಿಶೀಲನೆ", hi: "उत्तर समीक्षा" },
  "quiz.yourAnswer": { en: "Your answer:", kn: "ನಿಮ್ಮ ಉತ್ತರ:", hi: "आपका उत्तर:" },
  "quiz.notAnswered": { en: "Not answered", kn: "ಉತ್ತರಿಸಿಲ್ಲ", hi: "उत्तर नहीं दिया" },
  "quiz.correctLabel": { en: "Correct:", kn: "ಸರಿ:", hi: "सही:" },

  // Chat
  "chat.title": { en: "Speak with Swamiji", kn: "ಸ್ವಾಮೀಜಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ", hi: "स्वामीजी से बात करें" },
  "chat.introSub": {
    en: "Ask anything about his life, teachings, and wisdom",
    kn: "ಅವರ ಜೀವನ, ಬೋಧನೆಗಳು ಮತ್ತು ಜ್ಞಾನದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ",
    hi: "उनके जीवन, शिक्षाओं और ज्ञान के बारे में कुछ भी पूछें",
  },
  "chat.beginConversation": { en: "Begin Conversation", kn: "ಸಂಭಾಷಣೆ ಆರಂಭಿಸಿ", hi: "बातचीत शुरू करें" },
  "chat.namaste": { en: "Namaste", kn: "ನಮಸ್ತೆ", hi: "नमस्ते" },
  "chat.greetingBody": {
    en: "I am Swami Vivekananda. Ask me anything about my life, teachings, philosophy, or spiritual path. I am here to guide you.",
    kn: "ನಾನು ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ. ನನ್ನ ಜೀವನ, ಬೋಧನೆಗಳು, ತತ್ವಶಾಸ್ತ್ರ ಅಥವಾ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ. ನಾನು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಇಲ್ಲಿದ್ದೇನೆ.",
    hi: "मैं स्वामी विवेकानंद हूँ। मेरे जीवन, शिक्षाओं, दर्शन या आध्यात्मिक मार्ग के बारे में कुछ भी पूछें। मैं आपका मार्गदर्शन करने के लिए यहाँ हूँ।",
  },
  "chat.iSee": { en: "I see you are", kn: "ನಿಮಗೆ", hi: "मैं देख रहा हूँ कि आपकी आयु" },
  "chat.yearsOld": { en: "years old.", kn: "ವರ್ಷ ಎಂದು ತಿಳಿಯುತ್ತದೆ.", hi: "वर्ष है।" },
  "chat.talkingWith": { en: "Talking with", kn: "ಇವರೊಂದಿಗೆ ಮಾತನಾಡುತ್ತಿದೆ", hi: "बात कर रहे हैं" },
  "chat.age": { en: "age", kn: "ವಯಸ್ಸು", hi: "आयु" },
  "chat.reset": { en: "Reset", kn: "ಮರುಹೊಂದಿಸಿ", hi: "रीसेट" },
  "chat.newConversation": { en: "New conversation", kn: "ಹೊಸ ಸಂಭಾಷಣೆ", hi: "नई बातचीत" },
  "chat.sources": { en: "Sources", kn: "ಆಕರಗಳು", hi: "स्रोत" },
  "chat.inputPlaceholder": { en: "Ask Swamiji a question…", kn: "ಸ್ವಾಮೀಜಿಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ…", hi: "स्वामीजी से प्रश्न पूछें…" },
  "chat.speakOrType": { en: "Speak or Type", kn: "ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ", hi: "बोलें या टाइप करें" },
  "chat.autoReset": {
    en: "Auto-resets after 3 min idle",
    kn: "೩ ನಿಮಿಷ ನಿಷ್ಕ್ರಿಯತೆಯ ನಂತರ ಸ್ವಯಂ ಮರುಹೊಂದಿಕೆ",
    hi: "3 मिनट निष्क्रियता के बाद स्वतः रीसेट",
  },
  "chat.speakAria": { en: "Speak your question", kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಮಾತನಾಡಿ", hi: "अपना प्रश्न बोलें" },
  "chat.send": { en: "Send", kn: "ಕಳುಹಿಸಿ", hi: "भेजें" },
  "chat.fallbackAnswer": {
    en: "The wisdom of the masters teaches us that truth is one — it appears differently to different minds. Please rephrase your question and I shall try again.",
    kn: "ಸತ್ಯ ಒಂದೇ — ಅದು ಬೇರೆ ಬೇರೆ ಮನಸ್ಸುಗಳಿಗೆ ಬೇರೆಯಾಗಿ ಕಾಣುತ್ತದೆ ಎಂದು ಗುರುಗಳ ಜ್ಞಾನ ಕಲಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ, ನಾನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುತ್ತೇನೆ.",
    hi: "गुरुओं का ज्ञान हमें सिखाता है कि सत्य एक ही है — वह भिन्न मनों को भिन्न प्रतीत होता है। कृपया अपना प्रश्न दोबारा पूछें, मैं फिर प्रयास करूँगा।",
  },
  "chat.errorCosmic": {
    en: "A disturbance in the cosmic energy. Please try again in a moment.",
    kn: "ವಿಶ್ವ ಶಕ್ತಿಯಲ್ಲಿ ಒಂದು ವಿಚಲನೆ. ದಯವಿಟ್ಟು ಕ್ಷಣದಲ್ಲಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    hi: "ब्रह्मांडीय ऊर्जा में एक व्यवधान। कृपया कुछ क्षण बाद पुनः प्रयास करें।",
  },
  "chat.speechUnavailable": {
    en: "Speech recognition is not available. Please type your question.",
    kn: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.",
    hi: "वाणी पहचान उपलब्ध नहीं है। कृपया अपना प्रश्न टाइप करें।",
  },

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
