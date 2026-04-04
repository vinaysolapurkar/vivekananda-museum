import db from './db';

export async function seedData() {
  // Seed stations
  const stations = [
    { number: 1, title_en: "Birth of Narendranath", title_kn: "ನರೇಂದ್ರನಾಥನ ಜನನ", description_en: "Narendranath Datta was born on 12 January 1863 in Calcutta.", description_kn: "ನರೇಂದ್ರನಾಥ ದತ್ತ ಅವರು 12 ಜನವರಿ 1863ರಂದು ಕೋಲ್ಕತ್ತಾದಲ್ಲಿ ಜನಿಸಿದರು.", gallery_zone: "Childhood" },
    { number: 2, title_en: "Early Childhood", title_kn: "ಮೊದಲಿನ ಬಾಲ್ಯ", description_en: "Young Narendranath showed exceptional curiosity and questioning nature from the start.", description_kn: "ಎಳೆಯ ನರೇಂದ್ರನಾಥ ಅವರು ಆರಂಭದಿಂದಲೂ ವಿಶೇಷ ಕುತೂಹಲ ಮತ್ತು ಪ್ರಶ್ನಿಸುವ ಸ್ವಭಾವವನ್ನು ತೋರಿಸಿದರು.", gallery_zone: "Childhood" },
    { number: 3, title_en: "Meeting Sri Ramakrishna", title_kn: "ಶ್ರೀ ರಾಮಕೃಷ್ಣರನ್ನು ಭೇಟಿ", description_en: "The fateful meeting that changed his life forever.", description_kn: "ಅವನ ಜೀವನವನ್ನು ಶಾಶ್ವತವಾಗಿ ಬದಲಾಯಿಸಿದ ನಿರ್ಣಾಯಕ ಭೇಟಿ.", gallery_zone: "Spiritual Quest" },
  ];

  for (const s of stations) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO stations (number, title_en, title_kn, description_en, description_kn, gallery_zone) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [s.number, s.title_en, s.title_kn, s.description_en, s.description_kn, s.gallery_zone]
      });
    } catch(e) {}
  }

  // Seed a kiosk
  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO kiosks (id, name, location) VALUES (1, 'Main Kiosk 1', 'Gallery Entrance')`,
      args: []
    });
  } catch(e) {}

  // Seed slides
  const slides = [
    { kiosk_id: 1, slide_number: 1, title_en: "Welcome to Vivekananda Smriti", content_en: "Discover the life and teachings of Swami Vivekananda, one of India's greatest spiritual leaders.", title_kn: "ವಿವೇಕಾನಂದ ಸ್ಮೃತಿಗೆ ಸ್ವಾಗತ", content_kn: "ಭಾರತದ ಅತ್ಯಂತ ದೊಡ್ಡ ಆಧ್ಯಾತ್ಮಿಕ ನಾಯಕರಾದ ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರ ಜೀವನ ಮತ್ತು ಉಪದೇಶಗಳನ್ನು ಅನ್ವೇಷಿಸಿ." },
    { kiosk_id: 1, slide_number: 2, title_en: "The Four Yogas", content_en: "Vivekananda taught four paths to God: Karma Yoga, Bhakti Yoga, Jnana Yoga, and Raja Yoga.", title_kn: "ನಾಲ್ಕು ಯೋಗಗಳು", content_kn: "ವಿವೇಕಾನಂದರು ದೇವರೆಡೆಗೆ ನಾಲ್ಕು ಮಾರ್ಗಗಳನ್ನು ಕಲಿಸಿದರು: ಕರ್ಮ ಯೋಗ, ಭಕ್ತಿ ಯೋಗ, ಜ್ಞಾನ ಯೋಗ ಮತ್ತು ರಾಜ ಯೋಗ." },
    { kiosk_id: 1, slide_number: 3, title_en: "Arise and Awake", content_en: "\"Arise, awake, and stop not till the goal is reached.\" — Swami Vivekananda", title_kn: "ಎದ್ದೇಳಿ, ಜಾಗೃತರಾಗಿ, ಗುರಿಯನ್ನು ತಲುಪುವವರೆಗೆ ನಿಲ್ಲಬಾರದು.", content_kn: "\"ಎದ್ದೇಳಿ, ಜಾಗೃತರಾಗಿ, ಗುರಿಯನ್ನು ತಲುಪುವವರೆಗೆ ನಿಲ್ಲಬಾರದು.\" — ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ" },
  ];

  for (const slide of slides) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO slides (kiosk_id, slide_number, title_en, title_kn, content_en, content_kn) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [slide.kiosk_id, slide.slide_number, slide.title_en, slide.title_kn, slide.content_en, slide.content_kn]
      });
    } catch(e) {}
  }

  return { success: true };
}
