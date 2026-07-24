// Curated life-journey milestones for Swami Vivekananda (1863–1902).
// Trilingual (English / Kannada / Hindi). Grounded in the standard biography
// (Life of Swami Vivekananda by His Eastern & Western Disciples; The Complete Works).
//
// Phases mirror public/viveka-digvijaya/data/data.js (window.PHASES_DATA):
//   p1 #F39C12  Early Life & Indian Wandering        1863–1893
//   p2 #3498DB  First Western Tour & Parliament       1893–1897
//   p3 #2ECC71  Return to India & Mission Building     1897–1899
//   p4 #9B59B6  Second Western Tour                    1899–1900
//   p5 #E74C3C  Final Years in India                   1900–1902

import type { Lang } from "@/lib/i18n";

export type L10n = Record<Lang, string>;

export interface Phase {
  id: string;
  color: string;
  name: L10n;
  years: string;
}

export interface Milestone {
  year: string;
  date?: L10n;
  phase: string; // p1..p5
  location?: L10n;
  title: L10n;
  blurb: L10n;
}

export const PHASES: Phase[] = [
  {
    id: "p1",
    color: "#F39C12",
    years: "1863–1893",
    name: {
      en: "Early Life & Indian Wandering",
      kn: "ಆರಂಭಿಕ ಜೀವನ ಮತ್ತು ಭಾರತ ಪರಿವ್ರಜನ",
      hi: "प्रारंभिक जीवन एवं भारत परिव्रजन",
    },
  },
  {
    id: "p2",
    color: "#3498DB",
    years: "1893–1897",
    name: {
      en: "First Western Tour & Parliament",
      kn: "ಮೊದಲ ಪಾಶ್ಚಾತ್ಯ ಪ್ರವಾಸ ಮತ್ತು ಸರ್ವಧರ್ಮ ಸಮ್ಮೇಳನ",
      hi: "प्रथम पाश्चात्य यात्रा एवं धर्म संसद",
    },
  },
  {
    id: "p3",
    color: "#2ECC71",
    years: "1897–1899",
    name: {
      en: "Return to India & Mission",
      kn: "ಭಾರತಕ್ಕೆ ಮರಳುವಿಕೆ ಮತ್ತು ಮಿಷನ್ ಸ್ಥಾಪನೆ",
      hi: "भारत वापसी एवं मिशन की स्थापना",
    },
  },
  {
    id: "p4",
    color: "#9B59B6",
    years: "1899–1900",
    name: {
      en: "Second Western Tour",
      kn: "ಎರಡನೇ ಪಾಶ್ಚಾತ್ಯ ಪ್ರವಾಸ",
      hi: "द्वितीय पाश्चात्य यात्रा",
    },
  },
  {
    id: "p5",
    color: "#E74C3C",
    years: "1900–1902",
    name: {
      en: "Final Years in India",
      kn: "ಭಾರತದಲ್ಲಿ ಅಂತಿಮ ವರ್ಷಗಳು",
      hi: "भारत में अंतिम वर्ष",
    },
  },
];

export const PHASE_COLOR: Record<string, string> = Object.fromEntries(
  PHASES.map((p) => [p.id, p.color]),
);

export const MILESTONES: Milestone[] = [
  {
    year: "1863",
    phase: "p1",
    date: { en: "12 January 1863", kn: "೧೨ ಜನವರಿ ೧೮೬೩", hi: "12 जनवरी 1863" },
    location: { en: "Kolkata, Bengal", kn: "ಕೋಲ್ಕತಾ, ಬಂಗಾಳ", hi: "कोलकाता, बंगाल" },
    title: {
      en: "Birth of Narendranath",
      kn: "ನರೇಂದ್ರನಾಥನ ಜನನ",
      hi: "नरेंद्रनाथ का जन्म",
    },
    blurb: {
      en: "Born on Makar Sankranti to Vishwanath Datta and Bhuvaneshwari Devi in an affluent Kolkata family, the boy Narendranath was spirited, fearless and drawn to meditation from childhood.",
      kn: "ಮಕರ ಸಂಕ್ರಾಂತಿಯಂದು ವಿಶ್ವನಾಥ ದತ್ತ ಮತ್ತು ಭುವನೇಶ್ವರಿ ದೇವಿಯ ಸಿರಿವಂತ ಕೋಲ್ಕತಾ ಕುಟುಂಬದಲ್ಲಿ ಜನಿಸಿದ ಬಾಲಕ ನರೇಂದ್ರನಾಥ ಚಿಕ್ಕಂದಿನಿಂದಲೇ ನಿರ್ಭೀತ, ಚುರುಕು ಮತ್ತು ಧ್ಯಾನಶೀಲನಾಗಿದ್ದನು.",
      hi: "मकर संक्रांति के दिन विश्वनाथ दत्त और भुवनेश्वरी देवी के संपन्न कोलकाता परिवार में जन्मे बालक नरेंद्रनाथ बचपन से ही निर्भीक, तेजस्वी और ध्यान की ओर झुके हुए थे।",
    },
  },
  {
    year: "1879",
    phase: "p1",
    location: { en: "Presidency College, Kolkata", kn: "ಪ್ರೆಸಿಡೆನ್ಸಿ ಕಾಲೇಜು, ಕೋಲ್ಕತಾ", hi: "प्रेसीडेंसी कॉलेज, कोलकाता" },
    title: {
      en: "A Brilliant Student",
      kn: "ಪ್ರತಿಭಾವಂತ ವಿದ್ಯಾರ್ಥಿ",
      hi: "एक प्रतिभाशाली छात्र",
    },
    blurb: {
      en: "At Presidency College and the Scottish Church College he devoured Western philosophy, history and science, becoming an accomplished singer and debater with a piercing, questioning mind.",
      kn: "ಪ್ರೆಸಿಡೆನ್ಸಿ ಮತ್ತು ಸ್ಕಾಟಿಷ್ ಚರ್ಚ್ ಕಾಲೇಜಿನಲ್ಲಿ ಪಾಶ್ಚಾತ್ಯ ತತ್ತ್ವಶಾಸ್ತ್ರ, ಇತಿಹಾಸ ಮತ್ತು ವಿಜ್ಞಾನವನ್ನು ಆಳವಾಗಿ ಅಧ್ಯಯನ ಮಾಡಿದ ಅವನು ನಿಪುಣ ಗಾಯಕ ಹಾಗೂ ವಾದಪಟುವಾಗಿ ತೀಕ್ಷ್ಣ, ಪ್ರಶ್ನಾಶೀಲ ಬುದ್ಧಿಯನ್ನು ಬೆಳೆಸಿಕೊಂಡನು.",
      hi: "प्रेसीडेंसी और स्कॉटिश चर्च कॉलेज में उन्होंने पाश्चात्य दर्शन, इतिहास और विज्ञान का गहन अध्ययन किया, एक निपुण गायक तथा वाद-विवादकर्ता बने और तीक्ष्ण, जिज्ञासु बुद्धि विकसित की।",
    },
  },
  {
    year: "1881",
    phase: "p1",
    location: { en: "Brahmo Samaj, Kolkata", kn: "ಬ್ರಹ್ಮ ಸಮಾಜ, ಕೋಲ್ಕತಾ", hi: "ब्रह्म समाज, कोलकाता" },
    title: {
      en: "The Great Doubt",
      kn: "ಮಹಾ ಸಂಶಯ",
      hi: "महान संशय",
    },
    blurb: {
      en: "Restless amid the rationalism of the Brahmo Samaj, the young seeker was tormented by one burning question he put to every holy man he met — \"Sir, have you seen God?\"",
      kn: "ಬ್ರಹ್ಮ ಸಮಾಜದ ವಿಚಾರವಾದದ ನಡುವೆ ಅಶಾಂತನಾದ ಯುವ ಸಾಧಕನನ್ನು ಒಂದೇ ಜ್ವಲಂತ ಪ್ರಶ್ನೆ ಕಾಡಿತು; ಭೇಟಿಯಾದ ಪ್ರತಿ ಸಾಧುವಿಗೂ ಅವನು ಕೇಳಿದನು — \"ಮಹಾಶಯ, ನೀವು ದೇವರನ್ನು ಕಂಡಿದ್ದೀರಾ?\"",
      hi: "ब्रह्म समाज के बुद्धिवाद के बीच अशांत इस युवा साधक को एक ही ज्वलंत प्रश्न सताता रहा, जो उन्होंने हर मिलने वाले संत से पूछा — \"महाशय, क्या आपने ईश्वर को देखा है?\"",
    },
  },
  {
    year: "1881",
    phase: "p1",
    date: { en: "November 1881", kn: "ನವೆಂಬರ್ ೧೮೮೧", hi: "नवंबर 1881" },
    location: { en: "Dakshineswar Temple", kn: "ದಕ್ಷಿಣೇಶ್ವರ ದೇವಾಲಯ", hi: "दक्षिणेश्वर मंदिर" },
    title: {
      en: "Meeting Sri Ramakrishna",
      kn: "ಶ್ರೀ ರಾಮಕೃಷ್ಣರ ಭೇಟಿ",
      hi: "श्री रामकृष्ण से भेंट",
    },
    blurb: {
      en: "At Dakshineswar he met Sri Ramakrishna, who answered without hesitation, \"Yes, I see God just as I see you, only more clearly.\" That reply changed the course of his life.",
      kn: "ದಕ್ಷಿಣೇಶ್ವರದಲ್ಲಿ ಅವನು ಶ್ರೀ ರಾಮಕೃಷ್ಣರನ್ನು ಭೇಟಿಯಾದನು; \"ಹೌದು, ನಿನ್ನನ್ನು ನೋಡುವಂತೆಯೇ ದೇವರನ್ನೂ ನೋಡುತ್ತೇನೆ, ಇನ್ನೂ ಸ್ಪಷ್ಟವಾಗಿ\" ಎಂದು ಸಂಶಯವಿಲ್ಲದೆ ಉತ್ತರಿಸಿದರು. ಆ ಉತ್ತರ ಅವನ ಜೀವನದ ದಿಕ್ಕನ್ನೇ ಬದಲಿಸಿತು.",
      hi: "दक्षिणेश्वर में उनकी भेंट श्री रामकृष्ण से हुई, जिन्होंने बिना किसी संकोच के उत्तर दिया — \"हाँ, मैं ईश्वर को वैसे ही देखता हूँ जैसे तुम्हें, बल्कि और भी स्पष्ट रूप से।\" इस उत्तर ने उनके जीवन की दिशा बदल दी।",
    },
  },
  {
    year: "1884",
    phase: "p1",
    location: { en: "Kolkata", kn: "ಕೋಲ್ಕತಾ", hi: "कोलकाता" },
    title: {
      en: "Loss and Hardship",
      kn: "ನಷ್ಟ ಮತ್ತು ಕಷ್ಟ",
      hi: "पिता की मृत्यु और संघर्ष",
    },
    blurb: {
      en: "The sudden death of his father plunged the family into poverty. Searching in vain for work, Narendranath tasted hunger and hardship, yet his faith deepened under Ramakrishna's care.",
      kn: "ತಂದೆಯ ಹಠಾತ್ ಮರಣವು ಕುಟುಂಬವನ್ನು ಬಡತನಕ್ಕೆ ದೂಡಿತು. ಕೆಲಸ ಹುಡುಕುತ್ತಾ ವಿಫಲನಾದ ನರೇಂದ್ರನಾಥ ಹಸಿವು ಮತ್ತು ಕಷ್ಟವನ್ನು ಅನುಭವಿಸಿದನು; ಆದರೂ ರಾಮಕೃಷ್ಣರ ಆಶ್ರಯದಲ್ಲಿ ಅವನ ಶ್ರದ್ಧೆ ಇನ್ನಷ್ಟು ಆಳವಾಯಿತು.",
      hi: "पिता की अचानक मृत्यु ने परिवार को दरिद्रता में धकेल दिया। रोजगार की तलाश में असफल नरेंद्रनाथ ने भूख और कठिनाई सही, फिर भी रामकृष्ण की छत्रछाया में उनकी श्रद्धा और गहरी होती गई।",
    },
  },
  {
    year: "1886",
    phase: "p1",
    date: { en: "16 August 1886", kn: "೧೬ ಆಗಸ್ಟ್ ೧೮೮೬", hi: "16 अगस्त 1886" },
    location: { en: "Cossipore, Kolkata", kn: "ಕಾಶೀಪುರ, ಕೋಲ್ಕತಾ", hi: "काशीपुर, कोलकाता" },
    title: {
      en: "The Master Departs",
      kn: "ಗುರುವಿನ ಮಹಾಪ್ರಸ್ಥಾನ",
      hi: "गुरु का महाप्रस्थान",
    },
    blurb: {
      en: "After tending his dying Master through his final illness at Cossipore, Narendra received Ramakrishna's spiritual power. On 16 August 1886 the Master entered mahasamadhi.",
      kn: "ಕಾಶೀಪುರದಲ್ಲಿ ಗುರುವಿನ ಕೊನೆಯ ಅನಾರೋಗ್ಯದ ಅವಧಿಯಲ್ಲಿ ಅವರ ಸೇವೆ ಮಾಡಿದ ನರೇಂದ್ರನಿಗೆ ರಾಮಕೃಷ್ಣರು ತಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿಯನ್ನು ಧಾರೆಯೆರೆದರು. ೧೬ ಆಗಸ್ಟ್ ೧೮೮೬ರಂದು ಗುರುಗಳು ಮಹಾಸಮಾಧಿ ಹೊಂದಿದರು.",
      hi: "काशीपुर में अपने गुरु की अंतिम बीमारी के दौरान सेवा करते हुए नरेंद्र को रामकृष्ण की आध्यात्मिक शक्ति प्राप्त हुई। 16 अगस्त 1886 को गुरुदेव महासमाधि में लीन हो गए।",
    },
  },
  {
    year: "1887",
    phase: "p1",
    location: { en: "Baranagar Math", kn: "ಬಾರಾನಗರ ಮಠ", hi: "बारानगर मठ" },
    title: {
      en: "The First Monastery",
      kn: "ಮೊದಲ ಮಠ",
      hi: "प्रथम मठ",
    },
    blurb: {
      en: "Gathering his brother-disciples in a dilapidated house at Baranagar, Narendra led them in taking formal monastic vows, forging the first brotherhood of Ramakrishna's monks.",
      kn: "ಬಾರಾನಗರದ ಶಿಥಿಲ ಮನೆಯೊಂದರಲ್ಲಿ ಗುರುಬಂಧುಗಳನ್ನು ಒಟ್ಟುಗೂಡಿಸಿದ ನರೇಂದ್ರ, ಅವರೆಲ್ಲರೊಂದಿಗೆ ಔಪಚಾರಿಕ ಸಂನ್ಯಾಸ ದೀಕ್ಷೆ ಸ್ವೀಕರಿಸಿ ರಾಮಕೃಷ್ಣರ ಸನ್ಯಾಸಿಗಳ ಮೊದಲ ಸಂಘವನ್ನು ರೂಪಿಸಿದನು.",
      hi: "बारानगर के एक जर्जर मकान में गुरुभाइयों को एकत्र कर नरेंद्र ने उनके साथ विधिवत संन्यास व्रत लिया और रामकृष्ण के संन्यासियों का पहला संघ स्थापित किया।",
    },
  },
  {
    year: "1888",
    phase: "p1",
    location: { en: "Across India", kn: "ಭಾರತದಾದ್ಯಂತ", hi: "समस्त भारत" },
    title: {
      en: "The Wandering Monk",
      kn: "ಪರಿವ್ರಾಜಕ ಸಂನ್ಯಾಸಿ",
      hi: "परिव्राजक संन्यासी",
    },
    blurb: {
      en: "As an unknown parivrajaka he set out alone, staff and begging-bowl in hand, to wander the length of India for nearly five years — living with prince and pauper alike.",
      kn: "ಅಪರಿಚಿತ ಪರಿವ್ರಾಜಕನಾಗಿ, ದಂಡ ಮತ್ತು ಭಿಕ್ಷಾಪಾತ್ರೆ ಹಿಡಿದು ಒಬ್ಬಂಟಿಯಾಗಿ ಹೊರಟ ಅವನು ಸುಮಾರು ಐದು ವರ್ಷ ಭಾರತದ ಉದ್ದಗಲಕ್ಕೂ ಸಂಚರಿಸಿದನು — ರಾಜ ಮತ್ತು ಬಡವ ಇಬ್ಬರೊಂದಿಗೂ ಬದುಕಿದನು.",
      hi: "एक अनजान परिव्राजक के रूप में दंड और भिक्षापात्र लेकर अकेले निकल पड़े और लगभग पाँच वर्षों तक समस्त भारत में विचरण किया — राजा और रंक दोनों के साथ रहते हुए।",
    },
  },
  {
    year: "1892",
    phase: "p1",
    location: { en: "Mount Abu · Khetri", kn: "ಮೌಂಟ್ ಅಬು · ಖೇತ್ರಿ", hi: "माउंट आबू · खेतड़ी" },
    title: {
      en: "The Name Vivekananda",
      kn: "ವಿವೇಕಾನಂದ ಎಂಬ ಹೆಸರು",
      hi: "विवेकानंद नाम",
    },
    blurb: {
      en: "In Rajputana the Maharaja of Khetri became his devoted friend and, before the journey west, gave him the resounding monastic name by which the world would know him — Vivekananda.",
      kn: "ರಜಪೂತಾನದಲ್ಲಿ ಖೇತ್ರಿಯ ಮಹಾರಾಜನು ಅವನ ಶ್ರದ್ಧಾವಂತ ಗೆಳೆಯನಾದನು; ಪಶ್ಚಿಮ ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಜಗತ್ತು ಅವನನ್ನು ಗುರುತಿಸುವ ಗಂಭೀರ ಸಂನ್ಯಾಸ ನಾಮವನ್ನಿತ್ತನು — ವಿವೇಕಾನಂದ.",
      hi: "राजपूताना में खेतड़ी के महाराजा उनके श्रद्धालु मित्र बने और पश्चिम यात्रा से पूर्व उन्हें वह गौरवशाली संन्यास नाम दिया जिससे विश्व उन्हें जानेगा — विवेकानंद।",
    },
  },
  {
    year: "1892",
    phase: "p1",
    date: { en: "24–26 December 1892", kn: "೨೪–೨೬ ಡಿಸೆಂಬರ್ ೧೮೯೨", hi: "24–26 दिसंबर 1892" },
    location: { en: "Kanyakumari", kn: "ಕನ್ಯಾಕುಮಾರಿ", hi: "कन्याकुमारी" },
    title: {
      en: "Meditation at Land's End",
      kn: "ಭಾರತ ತುದಿಯಲ್ಲಿ ಧ್ಯಾನ",
      hi: "भारत के छोर पर ध्यान",
    },
    blurb: {
      en: "Reaching the southern tip of India, he swam to a lonely rock and meditated for three days on India's past, present and future — and there resolved to carry her message to the world.",
      kn: "ಭಾರತದ ದಕ್ಷಿಣ ತುದಿ ತಲುಪಿದ ಅವನು ಈಜಿ ಒಂಟಿ ಬಂಡೆಗೆ ಹೋಗಿ ಮೂರು ದಿನ ಭಾರತದ ಭೂತ, ವರ್ತಮಾನ ಮತ್ತು ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಧ್ಯಾನಿಸಿದನು — ಅಲ್ಲಿಯೇ ಅವಳ ಸಂದೇಶವನ್ನು ಜಗತ್ತಿಗೆ ಕೊಂಡೊಯ್ಯಲು ಸಂಕಲ್ಪಿಸಿದನು.",
      hi: "भारत के दक्षिणतम छोर पर पहुँचकर वे तैरकर एक निर्जन शिला पर गए और तीन दिन भारत के अतीत, वर्तमान और भविष्य पर ध्यान किया — वहीं उन्होंने उसका संदेश विश्व तक पहुँचाने का संकल्प लिया।",
    },
  },
  {
    year: "1893",
    phase: "p2",
    date: { en: "31 May 1893", kn: "೩೧ ಮೇ ೧೮೯೩", hi: "31 मई 1893" },
    location: { en: "Bombay → Chicago", kn: "ಬೊಂಬಾಯಿ → ಚಿಕಾಗೊ", hi: "बंबई → शिकागो" },
    title: {
      en: "Voyage to the West",
      kn: "ಪಶ್ಚಿಮಕ್ಕೆ ಸಮುದ್ರಯಾನ",
      hi: "पश्चिम की ओर प्रस्थान",
    },
    blurb: {
      en: "Setting sail from Bombay, he journeyed through Ceylon, Japan and China to America, an unknown monk bound for the Parliament of Religions with no formal invitation, sustained only by faith.",
      kn: "ಬೊಂಬಾಯಿಯಿಂದ ಹಡಗಿನಲ್ಲಿ ಹೊರಟ ಅವನು ಸಿಲೋನ್, ಜಪಾನ್ ಮತ್ತು ಚೀನಾ ಮೂಲಕ ಅಮೆರಿಕಕ್ಕೆ ಸಾಗಿದನು — ಔಪಚಾರಿಕ ಆಹ್ವಾನವಿಲ್ಲದೆ, ಕೇವಲ ಶ್ರದ್ಧೆಯ ಬಲದಿಂದ ಸರ್ವಧರ್ಮ ಸಮ್ಮೇಳನಕ್ಕೆ ಹೊರಟ ಅಪರಿಚಿತ ಸಂನ್ಯಾಸಿ.",
      hi: "बंबई से जलयान द्वारा प्रस्थान कर वे सीलोन, जापान और चीन होते हुए अमेरिका पहुँचे — बिना किसी औपचारिक निमंत्रण के, केवल श्रद्धा के बल पर धर्म संसद की ओर बढ़ता एक अनजान संन्यासी।",
    },
  },
  {
    year: "1893",
    phase: "p2",
    date: { en: "11 September 1893", kn: "೧೧ ಸೆಪ್ಟೆಂಬರ್ ೧೮೯೩", hi: "11 सितंबर 1893" },
    location: { en: "Parliament of Religions, Chicago", kn: "ಸರ್ವಧರ್ಮ ಸಮ್ಮೇಳನ, ಚಿಕಾಗೊ", hi: "धर्म संसद, शिकागो" },
    title: {
      en: "Sisters and Brothers of America",
      kn: "ಅಮೆರಿಕದ ಸಹೋದರಿಯರೇ, ಸಹೋದರರೇ",
      hi: "अमेरिका के भाइयो और बहनो",
    },
    blurb: {
      en: "With the words \"Sisters and Brothers of America,\" he brought seven thousand people to their feet. In moments the unknown monk became the voice of Vedanta and of a resurgent India.",
      kn: "\"ಅಮೆರಿಕದ ಸಹೋದರಿಯರೇ ಮತ್ತು ಸಹೋದರರೇ\" ಎಂಬ ಮಾತುಗಳಿಂದ ಏಳು ಸಾವಿರ ಜನರನ್ನು ಎದ್ದು ನಿಲ್ಲುವಂತೆ ಮಾಡಿದನು. ಕ್ಷಣಗಳಲ್ಲಿ ಅಪರಿಚಿತ ಸಂನ್ಯಾಸಿ ವೇದಾಂತದ ಮತ್ತು ಪುನರುತ್ಥಾನಗೊಂಡ ಭಾರತದ ಧ್ವನಿಯಾದನು.",
      hi: "\"अमेरिका के भाइयो और बहनो\" — इन शब्दों से उन्होंने सात हजार लोगों को खड़ा कर दिया। क्षणों में वह अनजान संन्यासी वेदांत और पुनर्जागृत भारत की वाणी बन गया।",
    },
  },
  {
    year: "1894",
    phase: "p2",
    location: { en: "United States & England", kn: "ಅಮೆರಿಕ ಮತ್ತು ಇಂಗ್ಲೆಂಡ್", hi: "अमेरिका एवं इंग्लैंड" },
    title: {
      en: "Spreading Vedanta",
      kn: "ವೇದಾಂತ ಪ್ರಸಾರ",
      hi: "वेदांत का प्रसार",
    },
    blurb: {
      en: "For nearly four years he lectured across America and England, founding the Vedanta Society of New York and drawing devoted disciples such as Sister Nivedita and the Seviers.",
      kn: "ಸುಮಾರು ನಾಲ್ಕು ವರ್ಷ ಅಮೆರಿಕ ಮತ್ತು ಇಂಗ್ಲೆಂಡಿನಾದ್ಯಂತ ಉಪನ್ಯಾಸ ನೀಡಿ, ನ್ಯೂಯಾರ್ಕ್ ವೇದಾಂತ ಸೊಸೈಟಿಯನ್ನು ಸ್ಥಾಪಿಸಿ, ಸಿಸ್ಟರ್ ನಿವೇದಿತಾ ಮತ್ತು ಸೆವಿಯರ್ ದಂಪತಿಗಳಂತಹ ಶ್ರದ್ಧಾವಂತ ಶಿಷ್ಯರನ್ನು ಆಕರ್ಷಿಸಿದನು.",
      hi: "लगभग चार वर्षों तक उन्होंने अमेरिका और इंग्लैंड में व्याख्यान दिए, न्यूयॉर्क वेदांत सोसाइटी की स्थापना की और सिस्टर निवेदिता व सेवियर दंपति जैसे समर्पित शिष्यों को आकर्षित किया।",
    },
  },
  {
    year: "1897",
    phase: "p3",
    date: { en: "January 1897", kn: "ಜನವರಿ ೧೮೯೭", hi: "जनवरी 1897" },
    location: { en: "Colombo to Almora", kn: "ಕೊಲಂಬೊದಿಂದ ಅಲ್ಮೋರಾ", hi: "कोलंबो से अल्मोड़ा" },
    title: {
      en: "A Hero's Return",
      kn: "ವೀರೋಚಿತ ಸ್ವಾಗತ",
      hi: "विजयी वापसी",
    },
    blurb: {
      en: "Landing at Colombo to a hero's welcome, he swept from Ceylon to Almora delivering the stirring \"Lectures from Colombo to Almora,\" calling India to rise, awake and reclaim her soul.",
      kn: "ಕೊಲಂಬೊದಲ್ಲಿ ವೀರೋಚಿತ ಸ್ವಾಗತದೊಂದಿಗೆ ಇಳಿದ ಅವನು ಸಿಲೋನ್‌ನಿಂದ ಅಲ್ಮೋರಾವರೆಗೆ ಸಂಚರಿಸಿ \"ಕೊಲಂಬೊದಿಂದ ಅಲ್ಮೋರಾ ಉಪನ್ಯಾಸಗಳನ್ನು\" ನೀಡಿ, ಎದ್ದೇಳಿ, ಎಚ್ಚರಗೊಳ್ಳಿ ಎಂದು ಭಾರತಕ್ಕೆ ಕರೆ ನೀಡಿದನು.",
      hi: "कोलंबो में वीरोचित स्वागत के साथ उतरकर वे सीलोन से अल्मोड़ा तक विचरण करते हुए ओजस्वी \"कोलंबो से अल्मोड़ा व्याख्यान\" देते रहे, और भारत को उठने, जागने तथा अपनी आत्मा को पुनः पाने का आह्वान किया।",
    },
  },
  {
    year: "1897",
    phase: "p3",
    date: { en: "1 May 1897", kn: "೧ ಮೇ ೧೮೯೭", hi: "1 मई 1897" },
    location: { en: "Kolkata", kn: "ಕೋಲ್ಕತಾ", hi: "कोलकाता" },
    title: {
      en: "The Ramakrishna Mission",
      kn: "ರಾಮಕೃಷ್ಣ ಮಿಷನ್",
      hi: "रामकृष्ण मिशन",
    },
    blurb: {
      en: "He founded the Ramakrishna Mission, uniting the ideals of renunciation and service under the motto \"For one's own liberation and for the good of the world.\"",
      kn: "\"ಆತ್ಮನೋ ಮೋಕ್ಷಾರ್ಥಂ ಜಗದ್ಧಿತಾಯ ಚ\" ಎಂಬ ಧ್ಯೇಯದಡಿ ತ್ಯಾಗ ಮತ್ತು ಸೇವೆಯ ಆದರ್ಶಗಳನ್ನು ಒಗ್ಗೂಡಿಸಿ ರಾಮಕೃಷ್ಣ ಮಿಷನ್ ಸ್ಥಾಪಿಸಿದನು.",
      hi: "\"आत्मनो मोक्षार्थं जगद्धिताय च\" के ध्येय के साथ त्याग और सेवा के आदर्शों को जोड़ते हुए उन्होंने रामकृष्ण मिशन की स्थापना की।",
    },
  },
  {
    year: "1898",
    phase: "p3",
    date: { en: "9 December 1898", kn: "೯ ಡಿಸೆಂಬರ್ ೧೮೯೮", hi: "9 दिसंबर 1898" },
    location: { en: "Belur Math, Bengal", kn: "ಬೇಲೂರು ಮಠ, ಬಂಗಾಳ", hi: "बेलूर मठ, बंगाल" },
    title: {
      en: "Belur Math Consecrated",
      kn: "ಬೇಲೂರು ಮಠ ಪ್ರತಿಷ್ಠಾಪನೆ",
      hi: "बेलूर मठ की स्थापना",
    },
    blurb: {
      en: "On the banks of the Ganga he established Belur Math as the permanent home of the Order — a temple to the harmony of all faiths and the enduring seat of Ramakrishna's movement.",
      kn: "ಗಂಗೆಯ ದಡದಲ್ಲಿ ಬೇಲೂರು ಮಠವನ್ನು ಸಂಘದ ಶಾಶ್ವತ ನೆಲೆಯಾಗಿ ಸ್ಥಾಪಿಸಿದನು — ಸಕಲ ಧರ್ಮಗಳ ಸಾಮರಸ್ಯದ ದೇಗುಲ ಹಾಗೂ ರಾಮಕೃಷ್ಣ ಆಂದೋಲನದ ಚಿರಸ್ಥಾಯಿ ಕೇಂದ್ರ.",
      hi: "गंगा के तट पर उन्होंने बेलूर मठ को संघ के स्थायी केंद्र के रूप में स्थापित किया — सभी धर्मों की समरसता का मंदिर और रामकृष्ण आंदोलन का चिरस्थायी केंद्र।",
    },
  },
  {
    year: "1899",
    phase: "p4",
    location: { en: "USA · England · France", kn: "ಅಮೆರಿಕ · ಇಂಗ್ಲೆಂಡ್ · ಫ್ರಾನ್ಸ್", hi: "अमेरिका · इंग्लैंड · फ्रांस" },
    title: {
      en: "The Second Western Tour",
      kn: "ಎರಡನೇ ಪಾಶ್ಚಾತ್ಯ ಪ್ರವಾಸ",
      hi: "द्वितीय पाश्चात्य यात्रा",
    },
    blurb: {
      en: "Though his health was failing, he sailed west once more, founding the Vedanta Society of San Francisco and the Shanti Ashrama, and speaking at the Congress of Religions in Paris.",
      kn: "ಆರೋಗ್ಯ ಕ್ಷೀಣಿಸುತ್ತಿದ್ದರೂ ಮತ್ತೊಮ್ಮೆ ಪಶ್ಚಿಮಕ್ಕೆ ಸಾಗಿ, ಸ್ಯಾನ್ ಫ್ರಾನ್ಸಿಸ್ಕೊ ವೇದಾಂತ ಸೊಸೈಟಿ ಮತ್ತು ಶಾಂತಿ ಆಶ್ರಮವನ್ನು ಸ್ಥಾಪಿಸಿ, ಪ್ಯಾರಿಸ್ ಧರ್ಮ ಸಮ್ಮೇಳನದಲ್ಲಿ ಮಾತನಾಡಿದನು.",
      hi: "स्वास्थ्य क्षीण होते हुए भी वे एक बार फिर पश्चिम गए, सैन फ्रांसिस्को वेदांत सोसाइटी और शांति आश्रम की स्थापना की, तथा पेरिस की धर्म संसद में व्याख्यान दिया।",
    },
  },
  {
    year: "1900",
    phase: "p5",
    date: { en: "December 1900", kn: "ಡಿಸೆಂಬರ್ ೧೯೦೦", hi: "दिसंबर 1900" },
    location: { en: "Belur Math", kn: "ಬೇಲೂರು ಮಠ", hi: "बेलूर मठ" },
    title: {
      en: "Homecoming and Rest",
      kn: "ಮನೆಗೆ ಮರಳುವಿಕೆ",
      hi: "घर वापसी और विश्राम",
    },
    blurb: {
      en: "Returning to Belur, he gave his final years to guiding the young Order, making pilgrimages to Mayavati, Varanasi and Bodh Gaya, and pouring his last strength into training its monks.",
      kn: "ಬೇಲೂರಿಗೆ ಮರಳಿದ ಅವನು ಅಂತಿಮ ವರ್ಷಗಳನ್ನು ಯುವ ಸಂಘಕ್ಕೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಮೀಸಲಿಟ್ಟನು; ಮಾಯಾವತಿ, ವಾರಾಣಸಿ ಮತ್ತು ಬೋಧಗಯೆಗೆ ಯಾತ್ರೆ ಮಾಡಿ, ಸಂನ್ಯಾಸಿಗಳ ತರಬೇತಿಗೆ ಕೊನೆಯ ಶಕ್ತಿಯನ್ನು ವಿನಿಯೋಗಿಸಿದನು.",
      hi: "बेलूर लौटकर उन्होंने अंतिम वर्ष युवा संघ के मार्गदर्शन में लगाए, मायावती, वाराणसी और बोधगया की यात्राएँ कीं, और अपनी शेष शक्ति संन्यासियों के प्रशिक्षण में लगा दी।",
    },
  },
  {
    year: "1902",
    phase: "p5",
    date: { en: "4 July 1902", kn: "೪ ಜುಲೈ ೧೯೦೨", hi: "4 जुलाई 1902" },
    location: { en: "Belur Math", kn: "ಬೇಲೂರು ಮಠ", hi: "बेलूर मठ" },
    title: {
      en: "Mahasamadhi",
      kn: "ಮಹಾಸಮಾಧಿ",
      hi: "महासमाधि",
    },
    blurb: {
      en: "On the evening of 4 July 1902, aged only thirty-nine, he meditated and entered mahasamadhi at Belur Math — having declared he had a message that would fill the world for fifteen centuries.",
      kn: "೪ ಜುಲೈ ೧೯೦೨ರ ಸಂಜೆ, ಕೇವಲ ಮೂವತ್ತೊಂಬತ್ತು ವರ್ಷ ವಯಸ್ಸಿನಲ್ಲಿ, ಬೇಲೂರು ಮಠದಲ್ಲಿ ಧ್ಯಾನಿಸಿ ಮಹಾಸಮಾಧಿ ಹೊಂದಿದನು — ಹದಿನೈದು ಶತಮಾನ ಜಗತ್ತನ್ನು ತುಂಬುವ ಸಂದೇಶ ತನ್ನಲ್ಲಿದೆ ಎಂದು ಘೋಷಿಸಿದ್ದನು.",
      hi: "4 जुलाई 1902 की संध्या, मात्र उनतालीस वर्ष की आयु में, बेलूर मठ में ध्यानमग्न होकर उन्होंने महासमाधि ली — यह घोषणा करते हुए कि उनके पास ऐसा संदेश है जो पंद्रह शताब्दियों तक विश्व को भर देगा।",
    },
  },
];
