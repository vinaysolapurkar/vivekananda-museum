const Database = require('better-sqlite3');
const db = new Database('local.db');

// Clear existing locations
db.prepare('DELETE FROM travel_locations').run();

const insert = db.prepare(`
  INSERT INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const locations = [
  // PHASE 1: Formative Years (1863-1886)
  ["Calcutta (Kolkata)", "India", 22.5726, 88.3639, "1863-1877", "Born on January 12, 1863 at 3 Gourmohan Mukherjee Street. Early education at Presidency College. Immersed in Western philosophy — Kant, Schopenhauer, Spinoza.", "Formative Years", 1],
  ["Raipur", "India", 21.2514, 81.6296, "1877-1879", "Family relocated here. Traveled by bullock cart through dense forests as no railway existed. Tutored by his father Vishwanath Datta. First exposure to tribal India.", "Formative Years", 2],
  ["Dakshineswar", "India", 22.6553, 88.3578, "1881-1886", "First met Sri Ramakrishna in November 1881 at the Dakshineswar Kali Temple on the Hooghly River. Life oscillated between home and here for 5 years until the Master's mahasamadhi on August 16, 1886.", "Formative Years", 3],
  ["Baranagar", "India", 22.6427, 88.3653, "1886-1888", "After Sri Ramakrishna's passing, established the first monastery in a dilapidated house. Took formal vows of sannyasa in January 1887. Today: Baranagar Ramakrishna Mission Ashrama.", "Formative Years", 4],

  // PHASE 2: First Parivrajaka (1888-1890)
  ["Varanasi", "India", 25.3176, 83.0064, "Aug 1888", "First major destination as a wandering monk. Met the revered ascetic Trailanga Swami and scholar Pramadadas Mitra. Deep Vedic discussions. Today: Ramakrishna Mission Home of Service.", "First Wanderings", 5],
  ["Ayodhya", "India", 26.7922, 82.1998, "Late 1888", "Pilgrimage to the birthplace of Lord Rama. Part of his exploration of Northern India's sacred geography.", "First Wanderings", 6],
  ["Hathras", "India", 27.5937, 78.0537, "Late 1888", "Met Sharat Chandra Gupta, a railway station master who abandoned his post to follow Vivekananda. Initiated as Swami Sadananda — Vivekananda's first monastic disciple.", "First Wanderings", 7],
  ["Rishikesh", "India", 30.0869, 78.2676, "Oct 1888", "Valley filled with ascetics and yogis. Forced to return due to Sadananda's severe illness.", "First Wanderings", 8],
  ["Ghazipur", "India", 25.5878, 83.5747, "Feb-Mar 1890", "Met the ascetic Pavhari Baba in his subterranean cave. British judge Mr. Pennington first suggested he possessed the caliber to preach in England — planting the earliest seed for his global mission.", "First Wanderings", 9],

  // PHASE 3: Himalayas & Rajputana (1890-1891)
  ["Nainital", "India", 29.3919, 79.4542, "Jul 1890", "Commenced prolonged Himalayan expedition with Swami Akhandananda, resolving never to return until achieving his spiritual goals.", "Himalayas & Rajputana", 10],
  ["Almora", "India", 29.5971, 79.6591, "1890", "Deep Himalayan austerities. Reunited with brother-disciples Brahmananda, Saradananda, Turiyananda. Today: Ramakrishna Kutir.", "Himalayas & Rajputana", 11],
  ["Meerut", "India", 28.9845, 77.7064, "Nov 1890", "Resided with Bankubihari Chatterjee. Weeks of intense study, meditation, and prayer with brother-disciples.", "Himalayas & Rajputana", 12],
  ["Delhi", "India", 28.6139, 77.2090, "Jan 1891", "Left Meerut alone, abandoning the comfort of brother-disciples to explore independently and remain anonymous.", "Himalayas & Rajputana", 13],
  ["Alwar", "India", 27.5530, 76.6346, "Feb 1891", "Hosted by Dr. Guru Charan Laskar. Stayed 7 weeks, engaging with Maharaja Mangal Singh and deeply influencing the youth.", "Himalayas & Rajputana", 14],
  ["Jaipur", "India", 26.9124, 75.7873, "Apr 1891", "Transit through the Pink City en route to Ajmer.", "Himalayas & Rajputana", 15],
  ["Ajmer", "India", 26.4499, 74.6399, "Apr 20-22, 1891", "Stayed in Ghoshi Mahalla with Modan Gopal Dey Biswas, an employee of the Rajputana Malwa Railway.", "Himalayas & Rajputana", 16],
  ["Mount Abu", "India", 24.5926, 72.7156, "Summer 1891", "Serendipitously met Maharaja Ajit Singh of Khetri — one of the most consequential relationships of his life.", "Himalayas & Rajputana", 17],
  ["Khetri", "India", 28.0000, 75.7900, "Aug 7 - Oct 27, 1891", "Resided 80 days at royal Futteh Billass. Formally initiated the Maharaja. Exposed to vast socio-economic disparities of princely states. The Raja later gave him the name 'Vivekananda'. Today: Ramakrishna Mission Vivekananda Smriti Mandir.", "Himalayas & Rajputana", 18],

  // PHASE 4: Gujarat Circuit (1891-1892)
  ["Ahmedabad", "India", 23.0225, 72.5714, "Nov 1891", "Studied Islamic architecture and Jain traditions, deepening understanding of India's syncretic culture. Today: Ramakrishna Math.", "Gujarat Circuit", 19],
  ["Limbdi", "India", 22.5722, 71.8097, "Dec 1891", "Stayed with Thakore Saheb Jaswant Singhji, who first urged him to attend the Parliament of Religions in the West.", "Gujarat Circuit", 20],
  ["Junagadh", "India", 21.5222, 70.4579, "Jan-Feb 1892", "Base camp. Excursions to Girnar hills, observing austere practices of local sadhus.", "Gujarat Circuit", 21],
  ["Somnath (Veraval)", "India", 20.8880, 70.4013, "Feb 1892", "Visited the temple reconstructed by Ahalyabai Holkar. Met the Maharao of Kutch, who predicted his global impact.", "Gujarat Circuit", 22],
  ["Porbandar", "India", 21.6417, 69.6293, "Feb-Mar 1892", "Intellectual zenith of Gujarat tour. Stayed at Bhojeshwar Bungalow. Helped translate the Vedas, studied Panini's Mahabhashya, and learned French. Scholar Shankar Pandurang advised: 'People will understand you in the West.'", "Gujarat Circuit", 23],
  ["Dwarka", "India", 22.2394, 68.9678, "Mar 1892", "Meditated at ruins of Adi Shankaracharya's ancient Sarada Math. Visualized a 'dazzling light' symbolizing India's future resurgence.", "Gujarat Circuit", 24],
  ["Baroda (Vadodara)", "India", 22.3072, 73.1812, "Apr 1892", "Completed the exhaustive survey of Gujarat.", "Gujarat Circuit", 25],

  // PHASE 5: Maharashtra, Goa, Karnataka (1892)
  ["Pune", "India", 18.5204, 73.8567, "May 4-25, 1892", "Met fierce nationalist leader Bal Gangadhar Tilak. Synthesized spiritual views with the emerging political consciousness of the independence movement. Today: Ramakrishna Math.", "Southern India", 26],
  ["Mumbai (Bombay)", "India", 19.0760, 72.8777, "Jul 1892", "Brief stop. Hinted at attending the Parliament of Religions.", "Southern India", 27],
  ["Belgaum (Belagavi)", "India", 15.8497, 74.4977, "Oct 15-27, 1892", "Stayed 12 days. Hosted by Prof. S. Bhate (4 days) and Haripada Mitra (9 days). Stunned locals by conversing fluently in English. Today: Ramakrishna Mission Ashrama in the Fort.", "Southern India", 28],
  ["Margao, Goa", "India", 15.2832, 73.9862, "Late Oct 1892", "Spent 3 days at the Rachol Seminary studying Christian theological works, rare religious manuscripts, and printed works in Latin.", "Southern India", 29],
  ["Bangalore", "India", 12.9716, 77.5946, "Nov 1892", "Transit to Mysore. Engaged with local scholars.", "Southern India", 30],
  ["Mysore", "India", 12.2958, 76.6394, "Nov 10-30, 1892", "20-day stay that proved crucial. Hosted by Dewan Sir K. Seshadri Iyer, then invited to the royal palace by Maharaja Chamaraja Wodeyar. The Maharaja offered to fund his journey to Chicago. Today: Viveka Smaraka.", "Southern India", 31],

  // PHASE 6: Kerala & Kanyakumari (Dec 1892)
  ["Ernakulam", "India", 9.9816, 76.2999, "Early Dec 1892", "Historic all-night Sanskrit discourse with social reformer Chattampi Swamikal beneath a secluded tree, bridging intellectual traditions of Bengal and Kerala.", "Kanyakumari Resolve", 32],
  ["Trivandrum", "India", 8.5241, 76.9366, "Dec 13-22, 1892", "9-day stay as guest of Prof. K. Sundararama Iyer. Observers were struck by his immense spiritual magnetism.", "Kanyakumari Resolve", 33],
  ["Kanyakumari", "India", 8.0883, 77.5385, "Dec 24-26, 1892", "Swam across shark-infested waters to a detached rock. Meditated 3 days and nights. The 'Kanyakumari Resolve' — ceased meditating on abstract concepts, instead resolved to cross the ocean to America to seek material aid for India's starving millions. Today: Vivekananda Rock Memorial.", "Kanyakumari Resolve", 34],

  // PHASE 7: Preparation & Departure (1893)
  ["Madurai", "India", 9.9252, 78.1198, "Jan 1893", "Met Bhaskara Setupati, the Raja of Ramnad, who became an ardent disciple and promised financial aid for the American voyage.", "Preparation", 35],
  ["Chennai (Madras)", "India", 13.0827, 80.2707, "Early 1893", "Arrived as a 'beggarly sannyasi.' Met Alasinga Perumal and young enthusiasts who formed a subscription committee, going door-to-door to raise funds for his passage.", "Preparation", 36],
  ["Hyderabad", "India", 17.3850, 78.4867, "Feb 26-28, 1893", "Delivered his first formal public lecture. Visited ruins of Golconda and the Salar Jung Palace.", "Preparation", 37],

  // PHASE 8: First Western Expedition (1893-1896)
  ["Colombo", "Sri Lanka", 6.9271, 79.8612, "Jun 6-7, 1893", "Sailed from Bombay on May 31. Visited the Kelaniya Buddhist Temple during the stopover.", "First Western Journey", 38],
  ["Penang", "Malaysia", 5.4164, 100.3327, "Jun 1893", "Brief stopover on the maritime journey. Observed Southeast Asian cultures.", "First Western Journey", 39],
  ["Singapore", "Singapore", 1.3521, 103.8198, "Jun 1893", "Transit port on the voyage to the Far East.", "First Western Journey", 40],
  ["Hong Kong", "China", 22.3193, 114.1694, "Jun 1893", "Observed British colonial administration in Asia.", "First Western Journey", 41],
  ["Nagasaki", "Japan", 32.7503, 129.8779, "Jul 1893", "First stop in Japan. Meticulously observed rapid industrialization.", "First Western Journey", 42],
  ["Kobe", "Japan", 34.6901, 135.1956, "Jul 1893", "Continued his study of Japan's modernization. Desired Indian youth to emulate this progress.", "First Western Journey", 43],
  ["Tokyo", "Japan", 35.6762, 139.6503, "Jul 1893", "Explored the capital of Meiji Japan. Impressed by the synthesis of tradition and modernity.", "First Western Journey", 44],
  ["Yokohama", "Japan", 35.4437, 139.6380, "Jul 1893", "Boarded RMS Empress of India. Met industrialist Jamsetji Tata, planting seeds for the Indian Institute of Science.", "First Western Journey", 45],
  ["Vancouver", "Canada", 49.2827, -123.1207, "Jul 25, 1893", "First footstep on North American soil. Took the transcontinental train eastward.", "First Western Journey", 46],
  ["Chicago", "USA", 41.8781, -87.6298, "Sep 11, 1893", "Delivered the iconic 'Sisters and Brothers of America' speech at the World's Parliament of Religions. Catapulted to instant global fame. Fundamentally redefined Western perceptions of Hinduism.", "Parliament of Religions", 47],
  ["Minneapolis", "USA", 44.9778, -93.2650, "Nov 21, 1893", "Lectured in temperatures 21 degrees below zero Fahrenheit. Wore snow boots gifted by supporters.", "American Lectures", 48],
  ["Des Moines", "USA", 41.5868, -93.6250, "Dec 1893", "Part of the exhaustive Midwestern lecture tour through the grueling winter of 1893-94.", "American Lectures", 49],
  ["Memphis", "USA", 35.1495, -90.0490, "Jan 1894", "Extended the lecture tour into the American South.", "American Lectures", 50],
  ["Detroit", "USA", 42.3314, -83.0458, "Feb-Mar 1894", "Fiercely defended Indian culture against misrepresentations by colonial missionaries.", "American Lectures", 51],
  ["New York City", "USA", 40.7128, -74.0060, "Nov 1894", "Formally established the Vedanta Society of New York. Delivered advanced philosophical discourses.", "American Lectures", 52],
  ["Cambridge (Harvard)", "USA", 42.3736, -71.1097, "Dec 5-15, 1894", "Interacted with Harvard's philosophy department. High-level philosophical discourses.", "American Lectures", 53],
  ["Thousand Island Park", "USA", 44.2917, -76.0256, "Jun 18 - Aug 7, 1895", "7-week retreat in a secluded cottage on the St. Lawrence River. Instructed select disciples in deep meditative practices. Resulted in the famous 'Inspired Talks.'", "American Lectures", 54],
  ["London", "United Kingdom", 51.5074, -0.1278, "Sep 1895", "Stayed at 63 St. George's Drive. Highly successful parlor classes. Met Margaret Noble, who became Sister Nivedita.", "European Mission", 55],
  ["Oxford", "United Kingdom", 51.7520, -1.2577, "May 28, 1896", "Met the renowned Orientalist Max Müller. Deep scholarly exchange on Vedantic philosophy.", "European Mission", 56],
  ["Paris", "France", 48.8566, 2.3522, "Aug 1900", "Addressed the Congress of History of Religions during the International Exposition. Defended the antiquity of Indian spiritual traditions before European scholars.", "European Mission", 57],
  ["Naples", "Italy", 40.8518, 14.2681, "Dec 30, 1896", "Sailed for India aboard the Prinz Regent Luitpold, completing his first Western expedition.", "European Mission", 58],

  // PHASE 9: Triumphal Return (1897)
  ["Colombo (Return)", "Sri Lanka", 6.9271, 79.8612, "Jan 15, 1897", "Arrived not as an unknown monk but as a triumphant spiritual hero. Massive public ovations. Lectured in Kandy, Anuradhapura, and Jaffna.", "Triumphal Return", 59],
  ["Rameswaram", "India", 9.2876, 79.3129, "Jan 27, 1897", "The Raja of Ramnad personally drew Vivekananda's carriage. Thunderous lectures.", "Triumphal Return", 60],
  ["Chennai (Return)", "India", 13.0827, 80.2707, "Feb 6, 1897", "Stayed at Castle Kernan (now Vivekanandar Illam). Delivered landmark addresses outlining his vision for a revitalized India. Compiled as 'Lectures from Colombo to Almora.'", "Triumphal Return", 61],
  ["Calcutta (Return)", "India", 22.5726, 88.3639, "May 1, 1897", "Formally established the Ramakrishna Mission Association — blending ancient monastic renunciation with modern organized philanthropy.", "Institutional Building", 62],

  // PHASE 10: Kashmir & Final Years (1898-1902)
  ["Srinagar, Kashmir", "India", 34.0837, 74.7973, "Jun-Jul 1898", "Spent idyllic weeks on houseboats on the Jhelum River. On July 4, celebrated American Independence Day at Dal Lake for his Western disciples, composing the poem 'To the Fourth of July.'", "Kashmir & Final Years", 63],
  ["Amarnath Cave", "India", 34.2148, 75.5015, "Aug 2, 1898", "Entered the glacial cave wearing only a loincloth. Experienced profound spiritual exaltation before the ice lingam. Stated that Lord Shiva granted him the boon of choosing the time of his own death.", "Kashmir & Final Years", 64],
  ["Belur Math", "India", 22.6320, 88.3556, "Dec 9, 1898", "Consecrated the permanent headquarters of the Ramakrishna Order. The geographic center of the global Ramakrishna movement.", "Institutional Building", 65],

  // PHASE 11: Second Western Tour (1899-1900)
  ["Los Angeles", "USA", 34.0522, -118.2437, "Dec 3, 1899", "Delivered lectures to massive audiences on the American West Coast.", "Second Western Journey", 66],
  ["San Francisco", "USA", 37.7749, -122.4194, "Feb-May 1900", "Founded the Vedanta Society of San Francisco on April 14, 1900.", "Second Western Journey", 67],
  ["Constantinople", "Turkey", 41.0082, 28.9784, "Oct 1900", "Cultural tour of the former Byzantine capital.", "Second Western Journey", 68],
  ["Athens", "Greece", 37.9838, 23.7275, "Nov 1900", "Explored the cradle of Western philosophy.", "Second Western Journey", 69],
  ["Cairo", "Egypt", 30.0444, 31.2357, "Nov 1900", "Sensing the impending end of his life and longing for his brother-monks, abruptly abandoned his itinerary and boarded a ship for India.", "Second Western Journey", 70],

  // PHASE 12: Final Pilgrimages (1901-1902)
  ["Dhaka", "Bangladesh", 23.8103, 90.4125, "Mar 19 - Apr 4, 1901", "16-day stay. Delivered applauded lectures despite severe asthma. Met hundreds of visitors daily. Today: Ramakrishna Mission, Dhaka.", "Final Pilgrimages", 71],
  ["Guwahati", "India", 26.1445, 91.7362, "Apr 11, 1901", "Worshipped at the ancient Kamakhya Temple for nearly a week.", "Final Pilgrimages", 72],
  ["Shillong", "India", 25.5788, 91.8933, "Late Apr 1901", "Delivered his final recorded public address at Quinton Memorial Hall on April 27. Police intervention needed to manage the throngs. Today: RKM Vivekananda Cultural Centre.", "Final Pilgrimages", 73],
  ["Bodh Gaya", "India", 24.6961, 84.9911, "Jan 1902", "Sought spiritual solace at the great Buddhist holy site where the Buddha attained enlightenment.", "Final Pilgrimages", 74],
  ["Varanasi (Final)", "India", 25.3176, 83.0064, "Feb 1902", "Stayed 3 weeks at Gopal Lal Villa. Inspired local youth to form an association for serving destitute patients — evolved into the Ramakrishna Mission Home of Service.", "Final Pilgrimages", 75],
  ["Belur Math (Final)", "India", 22.6320, 88.3556, "Jul 4, 1902", "After a day of meditation, teaching Sanskrit grammar, and walking the grounds, Swami Vivekananda attained mahasamadhi at age 39 — fulfilling the timeline prophesied at Amarnath.", "Mahasamadhi", 76],
];

const tx = db.transaction(() => {
  for (const loc of locations) {
    insert.run(...loc);
  }
});

tx();
console.log(`Inserted ${locations.length} travel locations.`);
db.close();
