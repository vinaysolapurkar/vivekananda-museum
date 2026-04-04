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

  // Seed travel locations
  const locations = [
    { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, year: "1863", description: "Birth and early life of Narendranath Datta, later known as Swami Vivekananda.", phase: "Early Life" },
    { name: "Dakshineshwar", country: "India", lat: 22.6546, lng: 88.3577, year: "1881", description: "Met Sri Ramakrishna at Dakshineshwar Kali Temple, a turning point in his spiritual journey.", phase: "Spiritual Quest" },
    { name: "Mysore", country: "India", lat: 12.2958, lng: 76.6394, year: "1892", description: "Visited the Maharaja of Mysore who became a patron of his mission to the West.", phase: "Wandering Monk" },
    { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, year: "1893", description: "Delivered his iconic speech at the Parliament of the World's Religions, beginning with 'Sisters and Brothers of America'.", phase: "World Mission" },
    { name: "Yokohama", country: "Japan", lat: 35.4437, lng: 139.6380, year: "1893", description: "Visited Japan on his way to the Parliament of Religions in Chicago.", phase: "World Mission" },
    { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060, year: "1894", description: "Founded the Vedanta Society of New York, spreading Vedantic philosophy in the West.", phase: "World Mission" },
    { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, year: "1895", description: "Delivered lectures on Vedanta and met prominent intellectuals including Max Müller.", phase: "World Mission" },
    { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, year: "1900", description: "Visited Paris during his second trip to the West, attended the Congress of Religions.", phase: "Second Western Visit" },
    { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, year: "1897", description: "Triumphant return to the East, delivered lectures across Ceylon (Sri Lanka).", phase: "Return to India" },
    { name: "Madras (Chennai)", country: "India", lat: 13.0827, lng: 80.2707, year: "1897", description: "Received a hero's welcome, delivered powerful lectures inspiring the youth of India.", phase: "Return to India" },
    { name: "Almora", country: "India", lat: 29.5971, lng: 79.6591, year: "1898", description: "Retreated to the Himalayas for spiritual rejuvenation and meditation.", phase: "Later Years" },
    { name: "Belur Math", country: "India", lat: 22.6320, lng: 88.3510, year: "1897", description: "Founded the Ramakrishna Mission and established Belur Math as its headquarters.", phase: "Legacy" },
  ];

  for (const loc of locations) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [loc.name, loc.country, loc.lat, loc.lng, loc.year, loc.description, loc.phase, locations.indexOf(loc)]
      });
    } catch(e) {}
  }

  return { success: true };
}
