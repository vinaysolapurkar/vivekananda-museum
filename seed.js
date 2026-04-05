const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "local.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// 1. STATIONS — 10 audio-guide stations
// ---------------------------------------------------------------------------
const stations = [
  {
    number: 1,
    title_en: "Birth and Childhood",
    title_kn: "ಜನನ ಮತ್ತು ಬಾಲ್ಯ",
    title_hi: "जन्म और बचपन",
    description_en:
      "Narendranath Datta was born on 12 January 1863 at 3 Gourmohan Mukherjee Street in Calcutta (now Kolkata). His father, Vishwanath Datta, was a successful attorney at the Calcutta High Court, and his mother, Bhuvaneshwari Devi, was a devout housewife steeped in religious tradition. Even as a child, Narendra showed extraordinary qualities — a sharp intellect, a questioning mind, and a natural inclination toward meditation. He was an avid reader who devoured the Hindu scriptures, Western philosophy, and the sciences with equal enthusiasm. His childhood home was a melting pot of progressive and orthodox ideas, which shaped his future vision of a universal spirituality.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Early Life",
    sort_order: 1,
  },
  {
    number: 2,
    title_en: "Student Years at Scottish Church College",
    title_kn: "ಸ್ಕಾಟಿಷ್ ಚರ್ಚ್ ಕಾಲೇಜಿನ ವಿದ್ಯಾರ್ಥಿ ದಿನಗಳು",
    title_hi: "स्कॉटिश चर्च कॉलेज में विद्यार्थी जीवन",
    description_en:
      "Narendra enrolled at the Presidency College in 1880 and later transferred to the Scottish Church College (then the General Assembly's Institution) where he studied Western philosophy, European history, and logic under Professor William Hastie. It was Hastie who first mentioned Sri Ramakrishna to him, describing the priest at Dakshineswar as someone who experienced genuine religious ecstasy. Narendra excelled academically and was influenced by the rationalism of John Stuart Mill, David Hume, and Herbert Spencer, yet he remained restless — searching for a living experience of God rather than mere intellectual understanding.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Early Life",
    sort_order: 2,
  },
  {
    number: 3,
    title_en: "Meeting Sri Ramakrishna",
    title_kn: "ಶ್ರೀ ರಾಮಕೃಷ್ಣರ ಭೇಟಿ",
    title_hi: "श्री रामकृष्ण से मुलाकात",
    description_en:
      "In late 1881, Narendra visited Sri Ramakrishna Paramahamsa at the Dakshineswar Kali Temple, north of Calcutta. The young rationalist asked the saint bluntly: 'Sir, have you seen God?' Ramakrishna replied without hesitation: 'Yes, I have seen God. I see Him as I see you here, only more clearly.' This encounter was transformative. Over the next five years, Narendra became Ramakrishna's foremost disciple, though he continually tested his guru's teachings with intellectual rigour. Ramakrishna recognised in Narendra a spiritual giant who would carry Vedanta to the world, and he groomed the young man accordingly — teaching him the non-dual philosophy of Advaita Vedanta alongside the devotional paths of Bhakti.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Spiritual Journey",
    sort_order: 3,
  },
  {
    number: 4,
    title_en: "The Passing of Sri Ramakrishna and Monastic Vows",
    title_kn: "ಶ್ರೀ ರಾಮಕೃಷ್ಣರ ಮಹಾಸಮಾಧಿ ಮತ್ತು ಸನ್ಯಾಸ ದೀಕ್ಷೆ",
    title_hi: "श्री रामकृष्ण का महासमाधि और संन्यास दीक्षा",
    description_en:
      "Sri Ramakrishna passed away on 16 August 1886 at the Cossipore garden house after a prolonged battle with throat cancer. His young disciples, led by Narendra, gathered at a dilapidated house in Baranagar and formally took monastic vows on Christmas Eve 1886. Narendra became Swami Vivekananda. The Baranagar Math became the first monastery of the Ramakrishna Order. The monks lived in extreme poverty, sustaining themselves on alms and devoting their days to meditation, scriptural study, and philosophical debate. This period of intense austerity forged the iron will that Vivekananda would later bring to his mission on the world stage.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Spiritual Journey",
    sort_order: 4,
  },
  {
    number: 5,
    title_en: "Parivrajaka — Wandering Across India",
    title_kn: "ಪರಿವ್ರಾಜಕ — ಭಾರತ ಪರ್ಯಟನೆ",
    title_hi: "परिव्राजक — भारत भ्रमण",
    description_en:
      "From 1888 to 1893, Vivekananda travelled the length and breadth of India as a wandering monk (parivrajaka). He journeyed through Varanasi, Ayodhya, Agra, Vrindavan, Alwar, Jaipur, Ahmedabad, Pune, Belgaum, Bangalore, Mysore, Trivandrum, Kanyakumari, Madurai, Rameswaram, and Chennai. Sleeping in railway stations, walking barefoot through forests, accepting alms from the poorest villagers, he witnessed first-hand the dire poverty, caste oppression, and social fragmentation of colonial India. These experiences became the crucible for his later social philosophy — the conviction that spiritual liberation and material upliftment must go hand in hand. At the rocky tip of Kanyakumari, he meditated for three days on India's past, present, and future, resolving to attend the Parliament of Religions in Chicago.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Spiritual Journey",
    sort_order: 5,
  },
  {
    number: 6,
    title_en: "The 1893 Parliament of Religions, Chicago",
    title_kn: "1893 ರ ಚಿಕಾಗೋ ಧರ್ಮ ಸಂಸತ್ತು",
    title_hi: "1893 शिकागो धर्म संसद",
    description_en:
      "On 11 September 1893, Swami Vivekananda rose to address the World's Parliament of Religions at the Art Institute of Chicago. His opening words — 'Sisters and Brothers of America' — received a standing ovation of two minutes from an audience of over seven thousand. He spoke of the universal acceptance taught by Hinduism and the Vedantic doctrine that all religions are paths to the same truth. Over the following days he delivered multiple addresses on Hinduism, Buddhism, and the harmony of religions, becoming the most celebrated speaker at the Parliament. American newspapers hailed him as 'the greatest figure in the Parliament of Religions' and 'an orator by divine right.' This event marked the first major introduction of Hindu philosophy to the Western world and made Vivekananda an international figure overnight.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "World Stage",
    sort_order: 6,
  },
  {
    number: 7,
    title_en: "Lectures and Work in the West",
    title_kn: "ಪಾಶ್ಚಿಮಾತ್ಯ ದೇಶಗಳಲ್ಲಿ ಉಪನ್ಯಾಸ ಮತ್ತು ಕಾರ್ಯ",
    title_hi: "पश्चिमी देशों में व्याख्यान और कार्य",
    description_en:
      "After the Parliament, Vivekananda spent nearly four years in the West (1893–1897). He lectured extensively across the United States and England, teaching Raja Yoga, Jnana Yoga, Bhakti Yoga, and Karma Yoga. In New York, he founded the Vedanta Society in November 1894, the first Hindu institution in the Western world. He attracted devoted followers — among them Margaret Noble (Sister Nivedita) in London and Josephine MacLeod in New York. His classes on the Yoga Sutras of Patanjali in New York became the foundation of his landmark book 'Raja Yoga,' published in 1896. He also visited France, Germany, Italy, and Greece, drawing large audiences everywhere. His message was revolutionary: the divinity within every human being, the harmony of religions, and the urgent need for service to humanity as the highest form of worship.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "World Stage",
    sort_order: 7,
  },
  {
    number: 8,
    title_en: "Return to India and the Founding of the Ramakrishna Mission",
    title_kn: "ಭಾರತಕ್ಕೆ ಮರಳಿ ಮತ್ತು ರಾಮಕೃಷ್ಣ ಮಿಷನ್ ಸ್ಥಾಪನೆ",
    title_hi: "भारत वापसी और रामकृष्ण मिशन की स्थापना",
    description_en:
      "Vivekananda returned to India in January 1897 to a hero's welcome. From Colombo to Calcutta, massive crowds greeted him at every railway station. He delivered a series of lectures across the country — later collected as 'Lectures from Colombo to Almora' — urging Indians to shed their inferiority complex and take pride in their spiritual heritage while embracing modern education and science. On 1 May 1897, he founded the Ramakrishna Mission at Belur near Calcutta with a dual mandate: service to humanity (seva) and spiritual practice (sadhana). The Mission embodied his philosophy that practical Vedanta means serving God in the poor, the hungry, and the uneducated. It quickly grew into a network of hospitals, schools, and relief centres across India.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Legacy",
    sort_order: 8,
  },
  {
    number: 9,
    title_en: "Second Visit to the West and Belur Math",
    title_kn: "ಪಶ್ಚಿಮಕ್ಕೆ ಎರಡನೇ ಭೇಟಿ ಮತ್ತು ಬೇಲೂರು ಮಠ",
    title_hi: "पश्चिम की दूसरी यात्रा और बेलूर मठ",
    description_en:
      "In 1899, Vivekananda undertook a second journey to the West, visiting England, France, and the United States. He participated in the Congress of the History of Religions in Paris in 1900 and established the Vedanta Society of San Francisco. Returning to India in December 1900, he threw his remaining energy into organizing the Belur Math as the permanent headquarters of the Ramakrishna Order. He personally supervised the construction, designed the rules, and trained the monks. The Math's architecture symbolised his vision of a universal religion — blending Hindu, Islamic, Buddhist, and Christian architectural motifs. He also established the Advaita Ashrama in Mayavati, a Himalayan retreat dedicated exclusively to the study of non-dual Vedanta.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Legacy",
    sort_order: 9,
  },
  {
    number: 10,
    title_en: "Mahasamadhi and Eternal Legacy",
    title_kn: "ಮಹಾಸಮಾಧಿ ಮತ್ತು ಶಾಶ್ವತ ಪರಂಪರೆ",
    title_hi: "महासमाधि और शाश्वत विरासत",
    description_en:
      "Swami Vivekananda attained Mahasamadhi on 4 July 1902 at Belur Math. He was only 39 years old. On that evening, he retired to his room after teaching a Sanskrit grammar class, meditated, and passed away during meditation — fulfilling his own prediction that he would not live to be forty. His funeral pyre was lit on the bank of the Ganga, opposite the spot where Sri Ramakrishna had been cremated sixteen years earlier. In his brief life, Vivekananda revitalised Hinduism, introduced Vedanta and Yoga to the Western world, inspired India's national consciousness, and founded institutions of service that continue to operate in over 20 countries. His birthday, 12 January, is celebrated as National Youth Day in India. His message — 'Arise, awake, and stop not till the goal is reached' — remains one of the most powerful calls to action in modern history.",
    description_kn: "",
    description_hi: "",
    gallery_zone: "Legacy",
    sort_order: 10,
  },
];

const insertStation = db.prepare(`
  INSERT OR IGNORE INTO stations (number, title_en, title_kn, title_hi, description_en, description_kn, description_hi, gallery_zone, sort_order)
  VALUES (@number, @title_en, @title_kn, @title_hi, @description_en, @description_kn, @description_hi, @gallery_zone, @sort_order)
`);

// ---------------------------------------------------------------------------
// 2. KIOSKS & SLIDES
// ---------------------------------------------------------------------------
const kiosks = [
  { name: "Main Entrance Kiosk", location: "Lobby", screen_size: "55 inch", is_active: 1 },
  { name: "Gallery Wing Kiosk", location: "Gallery Hall", screen_size: "43 inch", is_active: 1 },
];

const insertKiosk = db.prepare(`
  INSERT OR IGNORE INTO kiosks (name, location, screen_size, is_active)
  VALUES (@name, @location, @screen_size, @is_active)
`);

// Slides will reference kiosk IDs obtained after insert

const slidesData = [
  // Kiosk 1 slides
  [
    { slide_number: 1, title_en: "Welcome to the Vivekananda Museum", content_en: "Explore the life, teachings, and legacy of Swami Vivekananda (1863-1902) — monk, philosopher, and one of modern India's greatest visionaries.", duration_seconds: 12, sort_order: 1 },
    { slide_number: 2, title_en: "Sisters and Brothers of America", content_en: "On 11 September 1893, Swami Vivekananda addressed the World's Parliament of Religions in Chicago. His opening words electrified the audience and introduced Hindu philosophy to the West.", duration_seconds: 15, sort_order: 2 },
    { slide_number: 3, title_en: "The Ramakrishna Mission", content_en: "Founded on 1 May 1897, the Ramakrishna Mission carries forward Vivekananda's ideal of service to humanity as worship of God. It operates hospitals, schools, and disaster relief programmes worldwide.", duration_seconds: 15, sort_order: 3 },
  ],
  // Kiosk 2 slides
  [
    { slide_number: 1, title_en: "Gallery Tour Guide", content_en: "This gallery traces Vivekananda's journey from his birthplace in Kolkata to the world stage and back. Follow the numbered stations for the full audio guide experience.", duration_seconds: 10, sort_order: 1 },
    { slide_number: 2, title_en: "Interactive Quiz", content_en: "Test your knowledge of Swami Vivekananda! Visit our quiz station or scan the QR code to take the quiz on your own device.", duration_seconds: 10, sort_order: 2 },
  ],
];

// ---------------------------------------------------------------------------
// 3. KNOWLEDGE BASE — 6 comprehensive documents
// ---------------------------------------------------------------------------
const knowledgeBase = [
  {
    title: "Biography of Swami Vivekananda",
    document_type: "text",
    content: `Swami Vivekananda (12 January 1863 – 4 July 1902), born Narendranath Datta, was an Indian Hindu monk, philosopher, author, and the chief disciple of the 19th-century mystic Sri Ramakrishna Paramahamsa. He was a key figure in the introduction of Vedanta and Yoga to the Western world and is credited with raising interfaith awareness, bringing Hinduism to the status of a major world religion during the late 19th century.

Early Life and Education
Narendranath was born into an affluent Bengali family in Calcutta (modern Kolkata) on 12 January 1863 during the festival of Makar Sankranti. His father, Vishwanath Datta, was an attorney at the Calcutta High Court known for his generous, progressive outlook. His mother, Bhuvaneshwari Devi, was a deeply religious woman who had a profound influence on her son. From childhood, Narendra displayed a restless temperament and a prodigious memory. He was trained in classical Indian music and was an accomplished singer. He studied at the Metropolitan Institution founded by Ishwar Chandra Vidyasagar and later at the Presidency College and Scottish Church College, where he excelled in philosophy, history, and the social sciences.

Meeting Ramakrishna
In November 1881, Narendra first met Sri Ramakrishna at the Dakshineswar Kali Temple. Though initially sceptical of Ramakrishna's mystical experiences, Narendra was deeply impressed by the saint's sincerity and his claim to have directly perceived God. Over the next five years, Narendra visited Dakshineswar frequently, gradually transforming from a rationalist sceptic into a devoted disciple. Ramakrishna's teachings — that all religions lead to the same God, that God-realisation is the supreme goal of life, and that selfless service is the purest form of worship — became the pillars of Vivekananda's philosophy.

Monastic Life
After Ramakrishna's death in August 1886, Narendra and a group of fellow disciples took formal monastic vows and established the first Ramakrishna monastery at Baranagar. Narendra assumed the name Swami Vivekananda during his wandering years (1888–1893). He spent nearly five years as a parivrajaka (wandering monk), travelling across India on foot and by train, staying in palaces and hovels alike, learning the pulse of the nation first-hand.

The Parliament of Religions
On 11 September 1893, Vivekananda represented Hinduism at the Parliament of the World's Religions in Chicago. His speech, beginning with "Sisters and Brothers of America," received a two-minute standing ovation. Over the next few days he delivered several more addresses that established his reputation as a powerful orator and deep thinker. He remained in the West until 1897, lecturing extensively in the United States and England, founding the Vedanta Society of New York (1894), and writing several books including Raja Yoga and Jnana Yoga.

Founding the Ramakrishna Mission
Returning to India in January 1897, Vivekananda was received as a national hero. He founded the Ramakrishna Mission on 1 May 1897, with a dual focus on spiritual development and humanitarian service. He established the Belur Math as its headquarters and oversaw the creation of educational institutions, hospitals, and relief organisations. He made a second visit to the West in 1899–1900, furthering the spread of Vedanta in Europe and America.

Death and Legacy
Vivekananda died on 4 July 1902, at the age of 39, during meditation at Belur Math. His disciples and admirers regard his passing as Mahasamadhi. His birthday, 12 January, is celebrated as National Youth Day in India. His ideas on nationalism, social service, and interfaith harmony continue to influence millions. The Ramakrishna Mission and Ramakrishna Math, the twin organisations he founded, operate centres in over 20 countries.`,
    is_active: 1,
  },
  {
    title: "Vivekananda's Teachings on Vedanta",
    document_type: "text",
    content: `Swami Vivekananda's philosophical teachings are primarily rooted in Advaita Vedanta, the non-dualistic school of Hindu philosophy systematised by Adi Shankaracharya in the 8th century. Vivekananda, however, presented Vedanta in a modern, practical form that he called "Practical Vedanta" or "Neo-Vedanta."

Core Principles of Vivekananda's Vedanta

1. The Divinity of the Soul (Atman)
Vivekananda taught that every living being is divine. The Atman (soul) is identical with Brahman (the ultimate reality). Ignorance (avidya) alone veils this truth. The goal of human life is to realise this innate divinity — not to become divine, but to manifest the divinity that is already within.

2. The Harmony of Religions
Drawing on Ramakrishna's experience of multiple religious paths, Vivekananda proclaimed that all religions are true and that they represent different paths leading to the same goal. He said: "I shall go to the mosque of the Mohammedan; I shall enter the Christian's church and kneel before the crucifix; I shall enter the Buddhist temple, where I shall take refuge in Buddha and in his Law; I shall go into the forest and sit down in meditation with the Hindu, who is trying to see the Light which enlightens the heart of every one."

3. Practical Vedanta — Service as Worship
Vivekananda's most distinctive contribution was the doctrine that the service of the poor, the sick, and the uneducated is itself worship of God. He proclaimed, "They alone live who live for others; the rest are more dead than alive." This philosophy transformed traditional Indian monasticism, which had been primarily contemplative, into an activist force for social good. He coined the term "daridra narayana" (God in the poor) and insisted that feeding a starving person was more sacred than building a temple.

4. The Four Yogas
Vivekananda systematised the teachings of Hinduism into four complementary paths:
- Jnana Yoga (the path of knowledge and discrimination)
- Bhakti Yoga (the path of love and devotion)
- Karma Yoga (the path of selfless action)
- Raja Yoga (the path of meditation and mind-control)
He argued that every person has a dominant tendency and should follow the yoga most suited to their temperament, while ideally practising elements of all four.

5. Strength and Fearlessness
Vivekananda constantly urged his listeners to develop physical, mental, and spiritual strength. His famous exhortation — "Arise, awake, and stop not till the goal is reached" (from the Katha Upanishad) — became his battle cry. He condemned weakness as sin: "It is a sin to think of yourselves as weak." He called upon India's youth to develop muscles of iron and nerves of steel, combined with a gigantic will.

6. Universal Religion
Vivekananda envisioned a universal religion that would transcend the boundaries of individual faiths. This religion would not replace existing religions but recognise the truth in each. He presented this idea at the Parliament of Religions in Chicago and in his later lectures. The universal religion, he argued, must be "broad enough to supply food for the scientific. It must be equally philosophic and emotional. It must be able to satisfy the requirements of the largest intellect and the most loving heart."`,
    is_active: 1,
  },
  {
    title: "The 1893 Parliament of Religions — Complete Account",
    document_type: "text",
    content: `The World's Parliament of Religions was held from 11 to 27 September 1893 at the Art Institute of Chicago, as part of the World's Columbian Exposition celebrating the 400th anniversary of Columbus's arrival in the Americas. It was the first formal gathering of representatives of Eastern and Western spiritual traditions.

Vivekananda's Journey to Chicago
Swami Vivekananda set out for America in May 1893 from Bombay (Mumbai), travelling via Colombo, Penang, Singapore, Hong Kong, Canton (Guangzhou), Nagasaki, Kobe, Yokohama, Vancouver, and finally reaching Chicago in July 1893. He carried no credentials and arrived without formal invitation. When he learned that the Parliament would not convene until September, he travelled to Boston, where he befriended Professor John Henry Wright of Harvard University. Wright was so impressed by Vivekananda that he wrote a letter of introduction to the Parliament's organisers, famously stating: "To ask for your credentials is like asking the sun about its right to shine."

The Opening Address — 11 September 1893
Vivekananda was nervous and repeatedly yielded his turn to other delegates. When he finally rose to speak in the afternoon session, he opened with the words: "Sisters and Brothers of America." The audience of over 7,000 people erupted into a two-minute standing ovation. The New York Herald reported: "He is undoubtedly the greatest figure in the Parliament of Religions. After hearing him we feel how foolish it is to send missionaries to this learned nation."

His opening address was brief but powerful. He quoted two Sanskrit verses — "As the different streams having their sources in different places all mingle their water in the sea, so, O Lord, the different paths which men take through different tendencies, various though they appear, crooked or straight, all lead to Thee" and "Whosoever comes to Me, through whatsoever form, I reach him; all men are struggling through paths which in the end lead to Me."

Key Speeches
Over the 17-day Parliament, Vivekananda delivered several major addresses:
- "Why We Disagree" — explaining the Vedantic view that religious differences arise from the same truth perceived through different temperaments
- "Paper on Hinduism" — a comprehensive exposition of Hindu philosophy covering the Vedas, Upanishads, and the concepts of Maya, Brahman, and liberation
- "Religion Not the Crying Need of India" — a powerful rebuke of missionary activity, arguing that India needed bread, not theology
- "The Ideal of a Universal Religion" — his vision of a religion that would recognise truth in all faiths and unite humanity

Impact and Significance
The Parliament of Religions transformed Vivekananda from an unknown Indian monk into an international celebrity. American newspapers devoted extensive coverage to his speeches. The New York Critique called him "an orator by divine right." He received hundreds of invitations to lecture across the United States. More significantly, the Parliament marked the first time Hinduism was presented as a major world religion on an equal footing with Christianity and Islam. Vivekananda's message of religious tolerance and universal acceptance had a profound impact on interfaith dialogue that reverberates to this day.

After the Parliament, Vivekananda spent nearly four years in America and England, delivering hundreds of public and private lectures, conducting classes on Vedanta and Yoga, and founding the first Hindu institutions in the Western world.`,
    is_active: 1,
  },
  {
    title: "Ramakrishna Mission — History and Activities",
    document_type: "text",
    content: `The Ramakrishna Mission is a Hindu religious and spiritual organisation founded by Swami Vivekananda on 1 May 1897, eleven years after the death of his guru, Sri Ramakrishna Paramahamsa. It is one of the most prominent religious and philanthropic organisations in India and operates centres in over 20 countries worldwide.

Founding Principles
The Mission was founded on two core ideas drawn from Ramakrishna's teachings and Vivekananda's philosophy:
1. Atmano mokshartham jagad-hitaya cha — "For the liberation of the self and the welfare of the world." This dual mandate of spiritual practice (sadhana) and humanitarian service (seva) distinguishes the Ramakrishna Mission from purely contemplative or purely activist organisations.
2. Shiva Jnane Jiva Seva — "Service to living beings as worship of God." Vivekananda taught that the highest form of worship is to see God in every human being and to serve the poor, the sick, and the uneducated as manifestations of the Divine.

Organisational Structure
The Mission has its headquarters at Belur Math, on the western bank of the Hooghly River near Kolkata. Belur Math also serves as the headquarters of the Ramakrishna Math, the monastic order. While the Math is primarily concerned with the spiritual lives of the monks, the Mission focuses on philanthropic and educational activities. Both organisations share the same leadership — the President of the Ramakrishna Math is also the President of the Ramakrishna Mission.

Key Activities and Institutions

Education: The Mission runs over 600 educational institutions, including primary schools, secondary schools, colleges, and vocational training centres. Notable institutions include the Ramakrishna Mission Vivekananda Educational and Research Institute (RKMVERI), a deemed university in Belur, and the Ramakrishna Mission Vidyamandira in Howrah.

Healthcare: The Mission operates multiple hospitals and dispensaries across India. The Ramakrishna Mission Seva Pratishthan in Kolkata is one of the largest charitable hospitals in eastern India, with over 600 beds.

Disaster Relief: The Mission has a long history of disaster relief work, beginning with famine relief in the early 1900s. It has provided relief during virtually every major natural disaster in India, including cyclones, floods, earthquakes, and tsunamis. During the COVID-19 pandemic, the Mission distributed food, medical supplies, and protective equipment across India.

Cultural Activities: The Mission publishes spiritual literature in multiple languages, runs libraries, organises lectures and seminars, and maintains museums and archives related to Sri Ramakrishna and Swami Vivekananda.

Rural Development: Through integrated rural development programmes, the Mission works on agriculture improvement, livestock care, sanitation, clean water access, and livelihood generation in underserved rural communities.

Global Presence
The Ramakrishna Mission and its affiliate Vedanta Societies operate centres in the United States, United Kingdom, France, Germany, Russia, Japan, Singapore, Malaysia, Brazil, Argentina, South Africa, Bangladesh, Sri Lanka, Fiji, and many other countries. Each centre conducts classes on Vedanta philosophy, meditation, and yoga, and engages in local charitable activities.`,
    is_active: 1,
  },
  {
    title: "Vivekananda's Travels in India and Abroad",
    document_type: "text",
    content: `Swami Vivekananda was one of the most widely travelled Indian monks of the 19th century. His journeys — both within India and across the globe — shaped his philosophy and gave him first-hand knowledge of the human condition across cultures.

Parivrajaka — Wandering Across India (1888–1893)
After the death of Sri Ramakrishna in 1886, Vivekananda spent two years at the Baranagar Math before setting out on a long pilgrimage across India. He travelled largely on foot and by train, relying on the hospitality of strangers and the traditional Indian practice of feeding wandering monks.

Major stops during his Indian wanderings:
- Varanasi (1888–1889): Studied Sanskrit texts, visited the ghats, engaged in philosophical debates with local scholars.
- Lucknow, Agra, Vrindavan: Visited holy sites and absorbed the diverse religious traditions of North India.
- Rajasthan (Alwar, Jaipur, Mount Abu, Jodhpur): Met the Maharaja of Alwar and other rulers; engaged in discussions on the social and spiritual regeneration of India.
- Gujarat (Ahmedabad, Junagadh, Porbandar): Studied Jain philosophy and visited sites associated with the life of Krishna.
- Maharashtra (Mumbai, Pune, Belgaum): Met Justice Mahadev Govind Ranade and other social reformers.
- South India (Bangalore, Mysore, Cochin, Trivandrum, Madurai, Rameswaram): Met the Maharajas of Mysore and Travancore, who became early supporters.
- Kanyakumari (December 1892): Swam to the rock (now Vivekananda Rock Memorial) and meditated for three days, resolving to go to the West.
- Chennai (Madras, February 1893): Met devoted followers who raised funds for his voyage to America.

First Journey to the West (1893–1897)
- May 1893: Departed from Bombay (Mumbai) by steamer.
- Route: Colombo → Penang → Singapore → Hong Kong → Canton → Nagasaki → Kobe → Yokohama → Vancouver → Chicago.
- Chicago (September 1893): Parliament of Religions.
- Toured the eastern and midwestern United States: New York, Boston, Detroit, Memphis, Des Moines, Indianapolis, Minneapolis.
- New York (1894–1896): Founded Vedanta Society, conducted yoga classes.
- London (1895–1896): Lectured at Princes' Hall and the Royal Institution; met Margaret Noble (later Sister Nivedita).
- Returned to India via Colombo in January 1897.

Second Journey to the West (1899–1900)
- Departed from Calcutta in June 1899.
- London (1899): Lectured and met old friends.
- New York and California (1899–1900): Founded the Vedanta Society of San Francisco; established the Shanti Ashrama retreat in the San Jose mountains.
- Paris (1900): Attended the Congress of the History of Religions; visited the Exposition Universelle.
- Brief visits to Vienna, Constantinople (Istanbul), Athens, and Cairo.
- Returned to India in December 1900 via the Suez Canal.

These travels gave Vivekananda a truly global perspective that was rare for his time. He saw first-hand the material prosperity of the West and the spiritual depth of the East, and he sought to create a synthesis that would uplift all of humanity.`,
    is_active: 1,
  },
  {
    title: "Famous Quotes and Sayings of Swami Vivekananda",
    document_type: "text",
    content: `Swami Vivekananda was known for his powerful oratory and pithy, memorable sayings. His words continue to inspire millions. Below is a collection of his most famous quotes, organised by theme, with context for each.

On Strength and Self-Confidence
- "Arise, awake, and stop not till the goal is reached." — Adapted from the Katha Upanishad (1.3.14), this became Vivekananda's most famous exhortation. He used it repeatedly in his lectures to urge Indians, especially the youth, to rouse themselves from apathy and work toward national and spiritual regeneration.
- "You cannot believe in God until you believe in yourself." — From a lecture in California, emphasising that self-confidence is the foundation of all spiritual and worldly achievement.
- "All the strength and succour you want is within yourselves." — Delivered during his Colombo to Almora lectures (1897), encouraging Indians to look inward for strength rather than depending on external aid.
- "It is a sin to think of yourselves as weak." — A recurring theme in his Indian lectures, challenging the colonial mentality of helplessness.
- "Strength is life, weakness is death." — A pithy summary of his practical philosophy, from his conversations with disciples.

On Service and Compassion
- "They alone live who live for others; the rest are more dead than alive." — One of his most famous sayings on selflessness, delivered in multiple lectures.
- "If you want to find God, serve man." — Encapsulating his philosophy of practical Vedanta — that the highest worship is service to living beings.
- "So long as millions live in hunger and ignorance, I hold every man a traitor who, having been educated at their expense, pays not the least heed to them." — A powerful statement from his letters, expressing his anguish at the condition of India's poor.

On Religion and Spirituality
- "The soul is not bound by the conditions of matter." — From his lectures on Vedanta, affirming the freedom and immortality of the Atman.
- "God is one, but his names are many." — A succinct expression of the Vedantic doctrine of the unity of all religions.
- "Do not be afraid of a few failures. Pick yourself up and try again. Attempt until you succeed." — Encouragement offered to young monks and students.
- "In a conflict between the heart and the brain, follow your heart." — Advice given to a disciple, reflecting his conviction that intuition and devotion are higher than mere intellect.

On Education
- "Education is the manifestation of perfection already in man." — His definition of education, rejecting the Western model of filling an empty vessel in favour of drawing out innate potential.
- "We want that education by which character is formed, strength of mind is increased, the intellect is expanded, and by which one can stand on one's own feet." — From a lecture in Madras (1897), outlining his vision of a national education system.

On India and Patriotism
- "The ideal of faith in ourselves is of the greatest help to us. If faith in ourselves had been more extensively taught and practised, I am sure a very large portion of the evils and miseries that we have would have vanished." — From 'Lectures from Colombo to Almora.'
- "Each nation has a destiny to fulfil, each nation has a message to deliver, each nation has a mission to accomplish." — Affirming India's spiritual mission to the world.

These quotations represent only a fraction of Vivekananda's vast written and spoken legacy, which fills nine volumes of his Complete Works.`,
    is_active: 1,
  },
];

const insertKnowledge = db.prepare(`
  INSERT OR IGNORE INTO knowledge_base (title, document_type, content, is_active)
  VALUES (@title, @document_type, @content, @is_active)
`);

// ---------------------------------------------------------------------------
// 4. QUIZ — 1 quiz with 10 questions
// ---------------------------------------------------------------------------
const quiz = {
  title: "Vivekananda Knowledge Test",
  language: "en",
  time_limit_minutes: 15,
  passing_score: 60,
  is_active: 1,
};

const insertQuiz = db.prepare(`
  INSERT OR IGNORE INTO quizzes (title, language, time_limit_minutes, passing_score, is_active)
  VALUES (@title, @language, @time_limit_minutes, @passing_score, @is_active)
`);

const questionsData = [
  {
    question_en: "When was Swami Vivekananda born?",
    options_en: ["12 January 1863", "15 August 1872", "2 October 1869", "14 November 1889"],
    correct_answer: 0,
    difficulty: "easy",
    sort_order: 1,
  },
  {
    question_en: "What was Swami Vivekananda's birth name?",
    options_en: ["Gadadhar Chattopadhyay", "Narendranath Datta", "Mool Shankar Tiwari", "Abhedananda Sen"],
    correct_answer: 1,
    difficulty: "easy",
    sort_order: 2,
  },
  {
    question_en: "At which temple did Vivekananda first meet Sri Ramakrishna?",
    options_en: ["Kalighat Temple", "Dakshineswar Kali Temple", "Birla Mandir", "Belur Math"],
    correct_answer: 1,
    difficulty: "medium",
    sort_order: 3,
  },
  {
    question_en: "In which year did Vivekananda deliver his famous speech at the Parliament of Religions in Chicago?",
    options_en: ["1890", "1893", "1897", "1901"],
    correct_answer: 1,
    difficulty: "easy",
    sort_order: 4,
  },
  {
    question_en: "What were the opening words of Vivekananda's Chicago speech?",
    options_en: [
      "Friends and Colleagues",
      "Ladies and Gentlemen of America",
      "Sisters and Brothers of America",
      "Dear Members of the Parliament",
    ],
    correct_answer: 2,
    difficulty: "easy",
    sort_order: 5,
  },
  {
    question_en: "When was the Ramakrishna Mission founded?",
    options_en: ["1 May 1897", "12 January 1895", "4 July 1902", "16 August 1886"],
    correct_answer: 0,
    difficulty: "medium",
    sort_order: 6,
  },
  {
    question_en: "Where is the headquarters of the Ramakrishna Mission?",
    options_en: ["Dakshineswar", "Varanasi", "Belur Math", "Mayavati"],
    correct_answer: 2,
    difficulty: "medium",
    sort_order: 7,
  },
  {
    question_en: "Which Harvard professor wrote a letter of introduction for Vivekananda to the Parliament of Religions?",
    options_en: ["William James", "John Henry Wright", "William Hastie", "Max Müller"],
    correct_answer: 1,
    difficulty: "hard",
    sort_order: 8,
  },
  {
    question_en: "At which place did Vivekananda meditate for three days before deciding to go to the West?",
    options_en: ["Almora", "Kanyakumari (Cape Comorin)", "Rishikesh", "Haridwar"],
    correct_answer: 1,
    difficulty: "medium",
    sort_order: 9,
  },
  {
    question_en: "On what date did Swami Vivekananda attain Mahasamadhi?",
    options_en: ["12 January 1902", "4 July 1902", "16 August 1902", "1 May 1902"],
    correct_answer: 1,
    difficulty: "medium",
    sort_order: 10,
  },
];

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO questions (quiz_id, question_en, options_en, correct_answer, difficulty, sort_order)
  VALUES (@quiz_id, @question_en, @options_en, @correct_answer, @difficulty, @sort_order)
`);

// ---------------------------------------------------------------------------
// 5. TRAVEL LOCATIONS — 18 real locations
// ---------------------------------------------------------------------------
const travelLocations = [
  { name: "Kolkata (Calcutta)", country: "India", lat: 22.5726, lng: 88.3639, year: "1863", description: "Birthplace of Narendranath Datta on 12 January 1863 at 3 Gourmohan Mukherjee Street in Shimla (Simla) area of North Kolkata.", phase: "Early Life", sort_order: 1 },
  { name: "Dakshineswar", country: "India", lat: 22.6535, lng: 88.3574, year: "1881", description: "Site of the Dakshineswar Kali Temple where Vivekananda first met Sri Ramakrishna in late 1881.", phase: "Spiritual Journey", sort_order: 2 },
  { name: "Varanasi", country: "India", lat: 25.3176, lng: 83.0064, year: "1888", description: "Vivekananda visited the holy city during his parivrajaka years, studying Sanskrit and engaging in philosophical discussions.", phase: "Wandering India", sort_order: 3 },
  { name: "Almora", country: "India", lat: 29.5971, lng: 79.6591, year: "1890", description: "Himalayan town where Vivekananda spent time in contemplation. He later established the Advaita Ashrama at nearby Mayavati in 1899.", phase: "Wandering India", sort_order: 4 },
  { name: "Jaipur", country: "India", lat: 26.9124, lng: 75.7873, year: "1891", description: "Visited during his wanderings through Rajasthan; met local rulers and scholars.", phase: "Wandering India", sort_order: 5 },
  { name: "Mumbai (Bombay)", country: "India", lat: 19.0760, lng: 72.8777, year: "1893", description: "Departed from Bombay harbour in May 1893 on the steamer to America.", phase: "Wandering India", sort_order: 6 },
  { name: "Kanyakumari", country: "India", lat: 8.0883, lng: 77.5385, year: "1892", description: "Meditated for three days on the rock at the southern tip of India (now Vivekananda Rock Memorial), resolving to attend the Parliament of Religions.", phase: "Wandering India", sort_order: 7 },
  { name: "Chennai (Madras)", country: "India", lat: 13.0827, lng: 80.2707, year: "1893", description: "Devoted followers in Madras raised funds for Vivekananda's voyage to America. He returned here in 1897 to a hero's welcome.", phase: "Wandering India", sort_order: 8 },
  { name: "Chicago", country: "United States", lat: 41.8781, lng: -87.6298, year: "1893", description: "Delivered his historic address at the World's Parliament of Religions at the Art Institute of Chicago on 11 September 1893.", phase: "World Stage", sort_order: 9 },
  { name: "New York City", country: "United States", lat: 40.7128, lng: -74.0060, year: "1894", description: "Founded the Vedanta Society of New York in November 1894 — the first Hindu institution in the Western world. Conducted Raja Yoga classes.", phase: "World Stage", sort_order: 10 },
  { name: "Boston", country: "United States", lat: 42.3601, lng: -71.0589, year: "1893", description: "Met Professor John Henry Wright of Harvard who arranged his entry to the Parliament of Religions.", phase: "World Stage", sort_order: 11 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, year: "1895", description: "Lectured extensively in London; met Margaret Noble who became Sister Nivedita and dedicated her life to Indian education.", phase: "World Stage", sort_order: 12 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, year: "1900", description: "Attended the Congress of the History of Religions in 1900 and visited the Exposition Universelle.", phase: "World Stage", sort_order: 13 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lng: -122.4194, year: "1900", description: "Founded the Vedanta Society of San Francisco during his second visit to the West.", phase: "World Stage", sort_order: 14 },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, year: "1897", description: "First stop on his triumphant return to India in January 1897. Delivered the opening lecture of his 'Colombo to Almora' series.", phase: "Return to India", sort_order: 15 },
  { name: "Belur Math", country: "India", lat: 22.6320, lng: 88.3527, year: "1898", description: "Established as the permanent headquarters of the Ramakrishna Math and Mission. Site of Vivekananda's Mahasamadhi on 4 July 1902.", phase: "Legacy", sort_order: 16 },
  { name: "Mysore", country: "India", lat: 12.2958, lng: 76.6394, year: "1892", description: "Met the Maharaja of Mysore, Chamarajendra Wadiyar X, who became a patron and helped fund his journey to America.", phase: "Wandering India", sort_order: 17 },
  { name: "Nagasaki", country: "Japan", lat: 32.7503, lng: 129.8779, year: "1893", description: "Stopped briefly during his voyage to America, observing Japanese Buddhist temples and culture.", phase: "World Stage", sort_order: 18 },
];

const insertTravel = db.prepare(`
  INSERT OR IGNORE INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order)
  VALUES (@name, @country, @lat, @lng, @year, @description, @phase, @sort_order)
`);

// ---------------------------------------------------------------------------
// 6. SLIDESHOW CATEGORIES
// ---------------------------------------------------------------------------
const slideshowCategories = [
  { name: "Early Life", description: "Photographs and illustrations from Vivekananda's childhood and youth in Kolkata (1863–1881).", sort_order: 1 },
  { name: "Chicago Address", description: "Images and documents from the 1893 Parliament of Religions in Chicago — the event that introduced Hindu philosophy to the Western world.", sort_order: 2 },
  { name: "Legacy", description: "The Ramakrishna Mission, Belur Math, and the enduring impact of Vivekananda's teachings across the globe.", sort_order: 3 },
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO slideshow_categories (name, description, sort_order)
  VALUES (@name, @description, @sort_order)
`);

// ---------------------------------------------------------------------------
// RUN ALL INSERTS INSIDE A TRANSACTION
// ---------------------------------------------------------------------------
const seed = db.transaction(() => {
  console.log("Seeding stations...");
  for (const s of stations) {
    insertStation.run(s);
  }

  console.log("Seeding kiosks...");
  const kioskIds = [];
  for (const k of kiosks) {
    const info = insertKiosk.run(k);
    kioskIds.push(info.lastInsertRowid || db.prepare("SELECT id FROM kiosks WHERE name = ?").get(k.name).id);
  }

  console.log("Seeding slides...");
  const insertSlide = db.prepare(`
    INSERT OR IGNORE INTO slides (kiosk_id, slide_number, title_en, content_en, duration_seconds, sort_order)
    VALUES (@kiosk_id, @slide_number, @title_en, @content_en, @duration_seconds, @sort_order)
  `);
  slidesData.forEach((slides, idx) => {
    const kioskId = kioskIds[idx];
    for (const slide of slides) {
      insertSlide.run({ ...slide, kiosk_id: kioskId });
    }
  });

  console.log("Seeding knowledge base...");
  for (const doc of knowledgeBase) {
    insertKnowledge.run(doc);
  }

  console.log("Seeding quiz...");
  const quizInfo = insertQuiz.run(quiz);
  const quizId = quizInfo.lastInsertRowid || db.prepare("SELECT id FROM quizzes WHERE title = ?").get(quiz.title).id;

  console.log("Seeding questions...");
  for (const q of questionsData) {
    insertQuestion.run({
      ...q,
      quiz_id: quizId,
      options_en: JSON.stringify(q.options_en),
    });
  }

  console.log("Seeding travel locations...");
  for (const loc of travelLocations) {
    insertTravel.run(loc);
  }

  console.log("Seeding slideshow categories...");
  for (const cat of slideshowCategories) {
    insertCategory.run(cat);
  }

  console.log("Seed complete.");
});

seed();
db.close();
