import type {
  CefrLevel,
  Language,
  LanguageConfig,
  LevelInfo,
  CurriculumUnit,
  ShadowPhrase,
  ScenarioConfig,
} from './types'

export const LANGUAGES: Record<Language, LanguageConfig> = {
  french: {
    name: 'French',
    native: 'Français',
    flag: '🇫🇷',
    code: 'fr-FR',
    teacher: 'Prof. Claire',
    exam: 'DELF / DALF',
    levelExams: {
      A1: 'DELF A1',
      A2: 'DELF A2',
      B1: 'DELF B1',
      B2: 'DELF B2',
      C1: 'DALF C1',
      C2: 'DALF C2',
    },
  },
  german: {
    name: 'German',
    native: 'Deutsch',
    flag: '🇩🇪',
    code: 'de-DE',
    teacher: 'Frau Schmidt',
    exam: 'Goethe-Zertifikat',
    levelExams: {
      A1: 'Goethe A1',
      A2: 'Goethe A2',
      B1: 'Goethe B1',
      B2: 'Goethe B2',
      C1: 'Goethe C1',
      C2: 'TestDaF',
    },
  },
  italian: {
    name: 'Italian',
    native: 'Italiano',
    flag: '🇮🇹',
    code: 'it-IT',
    teacher: 'Signora Rossi',
    exam: 'CILS / CELI',
    levelExams: {
      A1: 'CILS A1',
      A2: 'CILS A2',
      B1: 'CILS B1',
      B2: 'CILS B2',
      C1: 'CILS C1',
      C2: 'CILS C2',
    },
  },
}

export const LEVEL_INFO: Record<CefrLevel, LevelInfo> = {
  A1: { name: 'Breakthrough', targetHours: 80 },
  A2: { name: 'Waystage', targetHours: 160 },
  B1: { name: 'Threshold', targetHours: 380 },
  B2: { name: 'Vantage', targetHours: 580 },
  C1: { name: 'Advanced', targetHours: 800 },
  C2: { name: 'Mastery', targetHours: 1100 },
}

export const A1_CURRICULUM: CurriculumUnit[] = [
  {
    id: 1,
    title: 'Sounds & The Alphabet',
    description: 'Build your phonetic foundation first',
    estimatedHours: 8,
    sessions: [
      {
        id: '1.1',
        title: 'How This Language Sounds',
        mins: 45,
        activities: ['Listen', 'Phonetics', 'Shadow', 'Quiz'],
      },
      {
        id: '1.2',
        title: 'Vowels, Consonants & Accents',
        mins: 40,
        activities: ['Listen', 'Vocabulary', 'Shadow', 'Quiz'],
      },
      {
        id: '1.3',
        title: 'Stress, Rhythm & Melody',
        mins: 40,
        activities: ['Listen', 'Shadow', 'Shadow', 'Quiz'],
      },
      {
        id: '1.4',
        title: 'Unit 1 Speaking Test',
        mins: 30,
        activities: ['Shadow', 'Shadow', 'Scenario', 'Quiz'],
      },
    ],
  },
  {
    id: 2,
    title: 'First Contact: Greetings',
    description: 'How to meet people and start conversations',
    estimatedHours: 9,
    sessions: [
      {
        id: '2.1',
        title: 'Formal & Informal Greetings',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '2.2',
        title: 'Introducing Yourself',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Scenario', 'Quiz'],
      },
      {
        id: '2.3',
        title: 'How Are You & Small Talk',
        mins: 40,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '2.4',
        title: 'Saying Goodbye',
        mins: 35,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '2.5',
        title: 'Unit 2 Review & Role Play',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Scenario', 'Quiz'],
      },
    ],
  },
  {
    id: 3,
    title: 'Numbers, Time & Dates',
    description: 'Essential numbers and scheduling vocabulary',
    estimatedHours: 8,
    sessions: [
      {
        id: '3.1',
        title: 'Numbers 1 to 100',
        mins: 40,
        activities: ['Vocabulary', 'Shadow', 'Quiz', 'Quiz'],
      },
      {
        id: '3.2',
        title: 'Telling the Time',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '3.3',
        title: 'Days, Months & Seasons',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '3.4',
        title: 'Making Appointments',
        mins: 40,
        activities: ['Grammar', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '3.5',
        title: 'Unit 3 Review',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
  {
    id: 4,
    title: 'People & Family',
    description: 'Describe people, families and nationalities',
    estimatedHours: 9,
    sessions: [
      {
        id: '4.1',
        title: 'Family Members Vocabulary',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Quiz', 'Quiz'],
      },
      {
        id: '4.2',
        title: 'Nationalities & Countries',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '4.3',
        title: 'Physical Descriptions',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '4.4',
        title: 'Talking About Your Job',
        mins: 40,
        activities: ['Vocabulary', 'Grammar', 'Scenario', 'Quiz'],
      },
      {
        id: '4.5',
        title: 'Unit 4 Review',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
  {
    id: 5,
    title: 'Everyday Life & Routine',
    description: 'Daily activities, food, home, and shopping',
    estimatedHours: 10,
    sessions: [
      {
        id: '5.1',
        title: 'Morning Routine Vocabulary',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '5.2',
        title: 'Present Tense: Regular Verbs',
        mins: 50,
        activities: ['Grammar', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '5.3',
        title: 'Food & Meals',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '5.4',
        title: 'Shopping & Prices',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '5.5',
        title: 'Your Home & Furniture',
        mins: 40,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '5.6',
        title: 'Unit 5 Review',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
  {
    id: 6,
    title: 'Getting Around',
    description: 'Navigate cities, transport, and accommodation',
    estimatedHours: 9,
    sessions: [
      {
        id: '6.1',
        title: 'Places in a City',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Quiz', 'Quiz'],
      },
      {
        id: '6.2',
        title: 'Asking for Directions',
        mins: 50,
        activities: ['Vocabulary', 'Grammar', 'Scenario', 'Quiz'],
      },
      {
        id: '6.3',
        title: 'Transport & Tickets',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '6.4',
        title: 'At the Hotel',
        mins: 45,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '6.5',
        title: 'Unit 6 Review',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
  {
    id: 7,
    title: 'Leisure & Interests',
    description: 'Hobbies, sports, likes, dislikes, and weekend plans',
    estimatedHours: 8,
    sessions: [
      {
        id: '7.1',
        title: 'Hobbies & Sports Vocabulary',
        mins: 45,
        activities: ['Vocabulary', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '7.2',
        title: 'Likes & Dislikes',
        mins: 45,
        activities: ['Grammar', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '7.3',
        title: 'Weekend Plans',
        mins: 40,
        activities: ['Vocabulary', 'Shadow', 'Scenario', 'Quiz'],
      },
      {
        id: '7.4',
        title: 'Unit 7 Review',
        mins: 30,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
  {
    id: 8,
    title: 'A1 Exam Preparation',
    description: 'Mock exam practice across all four skills',
    estimatedHours: 9,
    sessions: [
      {
        id: '8.1',
        title: 'Listening Comprehension Practice',
        mins: 50,
        activities: ['Listen', 'Listen', 'Quiz', 'Quiz'],
      },
      {
        id: '8.2',
        title: 'Reading Comprehension Practice',
        mins: 50,
        activities: ['Listen', 'Grammar', 'Quiz', 'Quiz'],
      },
      {
        id: '8.3',
        title: 'Written Production Practice',
        mins: 50,
        activities: ['Grammar', 'Grammar', 'Shadow', 'Quiz'],
      },
      {
        id: '8.4',
        title: 'Oral Production Mock Exam',
        mins: 50,
        activities: ['Shadow', 'Shadow', 'Scenario', 'Scenario'],
      },
      {
        id: '8.5',
        title: 'Full A1 Mock Exam',
        mins: 60,
        activities: ['Shadow', 'Scenario', 'Quiz', 'Quiz'],
      },
    ],
  },
]

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'cafe',
    emoji: '☕',
    name: 'At a Café',
    description: 'Order drinks and food from a barista',
  },
  {
    id: 'hotel',
    emoji: '🏨',
    name: 'Hotel Check-in',
    description: 'Check in, ask for your room',
  },
  {
    id: 'market',
    emoji: '🛒',
    name: 'At the Market',
    description: 'Buy items, ask prices, negotiate',
  },
  {
    id: 'station',
    emoji: '🚂',
    name: 'Train Station',
    description: 'Buy a ticket, ask for the platform',
  },
  {
    id: 'doctor',
    emoji: '🏥',
    name: 'At the Doctor',
    description: 'Describe symptoms, understand advice',
  },
  {
    id: 'restaurant',
    emoji: '🍽️',
    name: 'Restaurant',
    description: 'Reserve a table, order your meal',
  },
]

export const SHADOW_PHRASES: Record<
  Language,
  Partial<Record<CefrLevel, ShadowPhrase[]>>
> = {
  french: {
    A1: [
      {
        text: "Bonjour, je m'appelle Marie.",
        phonetic: 'bon-ZHOOR, zhuh mah-PEL mah-REE',
        english: 'Hello, my name is Marie.',
      },
      {
        text: 'Comment allez-vous?',
        phonetic: 'koh-MAHN ah-lay-VOO',
        english: 'How are you? (formal)',
      },
      {
        text: 'Je suis étudiant.',
        phonetic: 'zhuh SWEE ay-tood-YAHN',
        english: 'I am a student.',
      },
      {
        text: "Où est la gare, s'il vous plaît?",
        phonetic: 'oo AY la GAHR, seel voo PLAY',
        english: 'Where is the station, please?',
      },
      {
        text: 'Je voudrais un café.',
        phonetic: 'zhuh voo-DREH uhn kah-FAY',
        english: 'I would like a coffee.',
      },
    ],
  },
  german: {
    A1: [
      {
        text: 'Guten Morgen, wie heißen Sie?',
        phonetic: 'GOO-ten MOR-gen, vee HY-sen ZEE',
        english: 'Good morning, what is your name?',
      },
      {
        text: 'Ich komme aus England.',
        phonetic: 'ich KOM-muh owss ENG-lant',
        english: 'I come from England.',
      },
      {
        text: 'Wo ist der Bahnhof?',
        phonetic: 'vo IST dair BAHN-hof',
        english: 'Where is the train station?',
      },
      {
        text: 'Ich hätte gerne ein Bier.',
        phonetic: 'ich HET-tuh GAIR-nuh ayn BEER',
        english: 'I would like a beer.',
      },
      {
        text: 'Das ist sehr schön.',
        phonetic: 'dass IST zair SHURN',
        english: 'That is very beautiful.',
      },
    ],
  },
  italian: {
    A1: [
      {
        text: 'Buongiorno, mi chiamo Marco.',
        phonetic: 'bwon-JOR-no, mee KYAH-mo MAR-ko',
        english: 'Good morning, my name is Marco.',
      },
      { text: 'Come stai?', phonetic: 'KOH-meh STI', english: 'How are you?' },
      {
        text: "Dov'è la stazione?",
        phonetic: 'do-VEH la sta-TSYO-neh',
        english: 'Where is the station?',
      },
      {
        text: 'Vorrei un caffè, per favore.',
        phonetic: 'vor-RAY oon kaf-FEH, pair fa-VO-ray',
        english: 'I would like a coffee, please.',
      },
      {
        text: 'Quanto costa?',
        phonetic: 'KWAN-to KOS-ta',
        english: 'How much does it cost?',
      },
    ],
  },
}

export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      maxUnits: 1,
      languages: 1,
      shadowPhrases: 5,
      scenarioRooms: false,
      pronunciationScoring: false,
    },
  },
  learner: {
    name: 'Learner',
    price: 9.99,
    features: {
      maxUnits: 999,
      languages: 1,
      shadowPhrases: 999,
      scenarioRooms: true,
      pronunciationScoring: true,
    },
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    features: {
      maxUnits: 999,
      languages: 3,
      shadowPhrases: 999,
      scenarioRooms: true,
      pronunciationScoring: true,
      mockExams: true,
    },
  },
  lifetime: {
    name: 'Lifetime',
    price: 249,
    features: {
      maxUnits: 999,
      languages: 999,
      shadowPhrases: 999,
      scenarioRooms: true,
      pronunciationScoring: true,
      mockExams: true,
      futureLanguages: true,
    },
  },
} as const
