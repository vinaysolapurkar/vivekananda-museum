import db, { initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    await initializeDatabase();

    // Check if data already exists
    const stationCount = await db.execute({ sql: "SELECT COUNT(*) as c FROM stations", args: [] });
    if (Number(stationCount.rows[0].c) > 0) {
      return Response.json({ success: true, message: "Database already initialized with data" });
    }

    // Seed stations
    const stations = [
      [1, "Birth and Early Life", "Birthplace of Narendranath Datta in Kolkata", "Early Life"],
      [2, "Meeting Sri Ramakrishna", "The transformative encounter at Dakshineswar", "Spiritual Journey"],
      [3, "Monastic Vows", "Taking sannyasa at Baranagar Math", "Spiritual Journey"],
      [4, "Wandering Monk", "Six years traversing India as a parivrajaka", "Indian Wanderings"],
      [5, "Kanyakumari Resolve", "Three days of meditation on the rock", "Indian Wanderings"],
      [6, "Parliament of Religions", "The historic Chicago address of 1893", "World Stage"],
      [7, "Vedanta in the West", "Teaching across America and Europe", "World Stage"],
      [8, "Return to India", "Triumphal homecoming and founding the Mission", "Legacy"],
      [9, "Ramakrishna Mission", "Establishing the organization on May 1, 1897", "Legacy"],
      [10, "Belur Math", "The permanent headquarters consecrated in 1898", "Legacy"],
    ];
    for (const [num, title, desc, zone] of stations) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO stations (number, title_en, description_en, gallery_zone, sort_order) VALUES (?, ?, ?, ?, ?)",
        args: [num, title, desc, zone, num],
      });
    }

    // Seed quizzes
    await db.execute({
      sql: "INSERT OR IGNORE INTO quizzes (id, title, time_limit_minutes, passing_score) VALUES (1, 'Vivekananda Knowledge Test', 15, 60)",
      args: [],
    });

    // Seed questions
    const questions = [
      ["What was Swami Vivekananda's original name?", '["Narendranath Datta","Ramesh Chandra","Gadadhar Chattopadhyay","Surendranath Banerjee"]', 0, "easy"],
      ["In which city was Swami Vivekananda born?", '["Mumbai","Kolkata","Chennai","Delhi"]', 1, "easy"],
      ["Who was Swami Vivekananda's spiritual master?", '["Swami Dayananda","Sri Ramakrishna","Sri Aurobindo","Ramana Maharshi"]', 1, "easy"],
      ["What organization did Vivekananda found?", '["Arya Samaj","Brahmo Samaj","Ramakrishna Mission","Theosophical Society"]', 2, "easy"],
      ["In which country did Vivekananda give his Chicago speech?", '["England","France","India","United States of America"]', 3, "easy"],
      ["What were the opening words of the Chicago speech?", '["Dear friends","Sisters and Brothers of America","Ladies and Gentlemen","People of the World"]', 1, "medium"],
      ["In which year was the Parliament of Religions?", '["1890","1893","1896","1900"]', 1, "medium"],
      ["Where is the headquarters of the Ramakrishna Mission?", '["Dakshineswar","Belur Math","Varanasi","Almora"]', 1, "medium"],
      ["Where did Vivekananda meditate for three days on a rock?", '["Rameswaram","Kanyakumari","Rishikesh","Haridwar"]', 1, "medium"],
      ["When was the Ramakrishna Mission founded?", '["1893","1895","1897","1899"]', 2, "medium"],
      ["Which Maharaja of Mysore offered to fund his Chicago trip?", '["Krishnaraja Wodeyar","Chamaraja Wodeyar","Jayachamaraja Wodeyar","Nalvadi Krishnaraja"]', 1, "medium"],
      ["What name did the Raja of Khetri give to Narendranath?", '["Sachchidananda","Vivekananda","Brahmananda","Shivananda"]', 1, "medium"],
      ["Which Harvard professor helped get Vivekananda into the Parliament?", '["William James","John Henry Wright","Charles Eliot","Max Müller"]', 1, "hard"],
      ["In which city did Vivekananda meet Bal Gangadhar Tilak?", '["Mumbai","Pune","Kolkata","Nagpur"]', 1, "hard"],
      ["On what date did Swami Vivekananda attain Mahasamadhi?", '["January 12, 1902","July 4, 1902","August 16, 1902","September 11, 1902"]', 1, "hard"],
      ["Where did Vivekananda learn French and help translate the Vedas?", '["Ahmedabad","Porbandar","Junagadh","Baroda"]', 1, "hard"],
      ["Who was the first monastic disciple of Swami Vivekananda?", '["Swami Brahmananda","Swami Sadananda","Swami Turiyananda","Swami Akhandananda"]', 1, "hard"],
      ["At which cave did Vivekananda have a vision of Lord Shiva?", '["Kedarnath","Amarnath","Badrinath","Vaishno Devi"]', 1, "hard"],
      ["Where did Vivekananda establish the Advaita Ashrama in 1899?", '["Almora","Mayavati","Rishikesh","Haridwar"]', 1, "hard"],
      ["Which industrialist did Vivekananda meet on the ship to Japan?", '["Jamsetji Tata","G.D. Birla","Ardeshir Godrej","Walchand Hirachand"]', 0, "hard"],
    ];
    for (let i = 0; i < questions.length; i++) {
      const [q, opts, correct, diff] = questions[i];
      await db.execute({
        sql: "INSERT OR IGNORE INTO questions (quiz_id, question_en, options_en, correct_answer, difficulty, sort_order) VALUES (1, ?, ?, ?, ?, ?)",
        args: [q, opts, correct, diff, i + 1],
      });
    }

    // Seed travel locations (key locations only for Vercel)
    const locations = [
      ["Calcutta (Kolkata)", "India", 22.5726, 88.3639, "1863", "Birthplace of Swami Vivekananda", "Early Life & Indian Wandering"],
      ["Dakshineswar", "India", 22.6553, 88.3578, "1881-1886", "First met Sri Ramakrishna at the Kali Temple", "Early Life & Indian Wandering"],
      ["Varanasi", "India", 25.3176, 83.0064, "1888", "Met Trailanga Swami and Pramadadas Mitra", "Early Life & Indian Wandering"],
      ["Khetri", "India", 28.0, 75.79, "1891", "Received the name Vivekananda from Maharaja Ajit Singh", "Early Life & Indian Wandering"],
      ["Mysore", "India", 12.2958, 76.6394, "1892", "Maharaja Chamaraja Wodeyar offered to fund his Chicago trip", "Early Life & Indian Wandering"],
      ["Kanyakumari", "India", 8.0883, 77.5385, "1892", "Three-day meditation — the Kanyakumari Resolve", "Early Life & Indian Wandering"],
      ["Chennai", "India", 13.0827, 80.2707, "1893", "Funds raised for passage to America", "Early Life & Indian Wandering"],
      ["Chicago", "USA", 41.8781, -87.6298, "1893", "Sisters and Brothers of America — Parliament of Religions", "First Western Tour"],
      ["New York", "USA", 40.7128, -74.006, "1894", "Founded the Vedanta Society of New York", "First Western Tour"],
      ["London", "UK", 51.5074, -0.1278, "1895", "Met Margaret Noble (Sister Nivedita)", "First Western Tour"],
      ["Colombo", "Sri Lanka", 6.9271, 79.8612, "1897", "Triumphal return from the West", "Return to India & Mission Building"],
      ["Belur Math", "India", 22.632, 88.3556, "1898", "Consecrated the permanent headquarters", "Return to India & Mission Building"],
      ["Amarnath", "India", 34.2148, 75.5015, "1898", "Vision of Lord Shiva in the glacial cave", "Return to India & Mission Building"],
      ["San Francisco", "USA", 37.7749, -122.4194, "1900", "Founded Vedanta Society of San Francisco", "Second Western Tour"],
      ["Paris", "France", 48.8566, 2.3522, "1900", "Congress of History of Religions", "Second Western Tour"],
      ["Belur Math (Final)", "India", 22.632, 88.3556, "1902", "Mahasamadhi on July 4, 1902", "Final Years & Mahasamadhi"],
    ];
    for (let i = 0; i < locations.length; i++) {
      const [name, country, lat, lng, year, desc, phase] = locations[i];
      await db.execute({
        sql: "INSERT OR IGNORE INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [name, country, lat, lng, year, desc, phase, i + 1],
      });
    }

    // Seed knowledge base
    const docs = [
      ["Biography of Swami Vivekananda", "Swami Vivekananda was born Narendranath Datta on January 12, 1863 in Kolkata. He was the chief disciple of Sri Ramakrishna Paramahamsa and the founder of the Ramakrishna Mission. He introduced Vedanta and Yoga to the Western world and is credited with raising interfaith awareness. His famous speech at the Parliament of World's Religions in Chicago in 1893 began with 'Sisters and Brothers of America' and received a standing ovation. He founded the Ramakrishna Mission on May 1, 1897. He attained Mahasamadhi on July 4, 1902 at Belur Math at the age of 39."],
      ["Teachings of Vivekananda", "Vivekananda taught that each soul is potentially divine and the goal of life is to manifest this divinity. He advocated the philosophy of Practical Vedanta — applying spiritual principles to solve real-world problems. He emphasized education, character building, and service to humanity. His key teachings include: Arise, awake and stop not till the goal is reached; Strength is life, weakness is death; You cannot believe in God until you believe in yourself; The greatest sin is to think yourself weak."],
      ["Chicago Address 1893", "On September 11, 1893, Swami Vivekananda addressed the Parliament of World's Religions in Chicago. His opening words 'Sisters and Brothers of America' received a two-minute standing ovation from the seven thousand attendees. He spoke about religious tolerance and universal acceptance, quoting from the Bhagavad Gita and explaining the Hindu view that all religions lead to the same truth. The speech established Hinduism as a major world religion in Western consciousness."],
    ];
    for (const [title, content] of docs) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO knowledge_base (title, document_type, content, is_active) VALUES (?, 'text', ?, 1)",
        args: [title, content],
      });
    }

    // Seed slideshow categories
    const categories = [
      ["Early Life", "Birth and formative years in Kolkata"],
      ["Chicago Address", "The historic 1893 Parliament of Religions"],
      ["Legacy", "Ramakrishna Mission and lasting impact"],
    ];
    for (const [name, desc] of categories) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO slideshow_categories (name, description) VALUES (?, ?)",
        args: [name, desc],
      });
    }

    return Response.json({ success: true, message: "Database initialized and seeded with all content" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message, stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
}
