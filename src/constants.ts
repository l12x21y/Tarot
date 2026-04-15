import type { ModeConfig, ModeId, TarotCard } from "./types";

const WIKIMEDIA_FILE = "https://commons.wikimedia.org/wiki/Special:FilePath";

const MAJOR_ARCANA: Omit<TarotCard, "id">[] = [
  { name: "The Fool", number: "0", meaning: "Beginnings, innocence, trust in the journey.", reversedMeaning: "Recklessness, hesitation, fear of the unknown.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_00_Fool.jpg`, imagery: "A traveler steps toward a cliff under bright skies, a small dog at their heels. A white rose and light pack suggest openness and faith." },
  { name: "The Magician", number: "I", meaning: "Willpower, manifestation, focused action.", reversedMeaning: "Manipulation, scattered focus, misuse of skill or wasted potential.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_01_Magician.jpg`, imagery: "A figure stands at a table with cup, wand, sword, and pentacle. One hand points upward and one downward, linking intention with action." },
  { name: "The High Priestess", number: "II", meaning: "Intuition, inner knowing, mystery.", reversedMeaning: "Secrets withheld, ignored gut feelings, surface answers.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_02_High_Priestess.jpg`, imagery: "A still seated priestess between dark and light pillars guards a veil of hidden symbols. The moon at her feet suggests quiet insight." },
  { name: "The Empress", number: "III", meaning: "Nurture, abundance, creativity.", reversedMeaning: "Creative block, smothering dependence, neglect of self or overprotectiveness.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_03_Empress.jpg`, imagery: "A crowned figure sits in a lush field of wheat and forest. The setting conveys fertility, comfort, and steady growth." },
  { name: "The Emperor", number: "IV", meaning: "Structure, authority, stability.", reversedMeaning: "Tyranny, rigidity, abuse of power, domination masked as order.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_04_Emperor.jpg`, imagery: "A stern ruler sits on a stone throne amid mountains. The ram motifs and red robe signal command and discipline." },
  { name: "The Hierophant", number: "V", meaning: "Tradition, guidance, institutions.", reversedMeaning: "Dogma, bad counsel, rebellion without wisdom, broken trust in mentors.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_05_Hierophant.jpg`, imagery: "A religious teacher raises a blessing before two followers. Ritual symbols and formal posture point to inherited systems." },
  { name: "The Lovers", number: "VI", meaning: "Union, choice, values alignment.", reversedMeaning: "Misalignment, temptation without clarity, poor choices, disharmony.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_06_Lovers.jpg`, imagery: "Two figures stand beneath an angel with a radiant sky above. A tree and serpent hint at desire, choice, and consequence." },
  { name: "The Chariot", number: "VII", meaning: "Determination, direction, control.", reversedMeaning: "Loss of control, aimless drive, aggression, stalled momentum.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_07_Chariot.jpg`, imagery: "A charioteer stands poised between two sphinxes. Armor, city walls, and stars suggest focused will in motion." },
  { name: "Strength", number: "VIII", meaning: "Courage, compassion, inner steadiness.", reversedMeaning: "Self-doubt, brute force instead of patience, repressed fear.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_08_Strength.jpg`, imagery: "A calm figure gently closes a lion's jaws beneath an infinity sign. The scene emphasizes quiet influence over force." },
  { name: "The Hermit", number: "IX", meaning: "Solitude, wisdom, introspection.", reversedMeaning: "Isolation without insight, loneliness, refusal to ask for guidance.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_09_Hermit.jpg`, imagery: "An elder stands alone on a snowy peak holding a lantern. The narrow light cone evokes deliberate inner searching." },
  { name: "Wheel of Fortune", number: "X", meaning: "Cycles, turning points, change.", reversedMeaning: "Bad timing, resisting cycles, feeling stuck, external setbacks.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_10_Wheel_of_Fortune.jpg`, imagery: "A great wheel floats among clouds with symbolic creatures at the corners. Motion and mystery imply shifting phases." },
  { name: "Justice", number: "XI", meaning: "Truth, accountability, balance.", reversedMeaning: "Injustice, bias, dishonesty, avoidance of accountability.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_11_Justice.jpg`, imagery: "A seated figure holds scales and sword between red curtains. The symmetrical composition suggests consequence and clear seeing." },
  { name: "The Hanged Man", number: "XII", meaning: "Pause, surrender, new perspective.", reversedMeaning: "Stalling, pointless sacrifice, martyrdom, fear of release.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_12_Hanged_Man.jpg`, imagery: "A man hangs upside down by one foot with a calm face and halo. Stillness transforms sacrifice into insight." },
  { name: "Death", number: "XIII", meaning: "Endings, release, transformation.", reversedMeaning: "Resistance to change, stagnation, fear of letting go.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_13_Death.jpg`, imagery: "A skeletal rider on a white horse moves through figures of different status. A distant sunrise signals renewal after closure." },
  { name: "Temperance", number: "XIV", meaning: "Integration, moderation, healing.", reversedMeaning: "Imbalance, extremes, friction between needs, poor integration.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_14_Temperance.jpg`, imagery: "An angel pours water between two cups, one foot on land and one in water. The flow indicates balance in progress." },
  { name: "The Devil", number: "XV", meaning: "Attachment, shadow, false limits.", reversedMeaning: "Denial of bondage, hidden addiction, self-deception about what holds you.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_15_Devil.jpg`, imagery: "A horned figure towers over two chained people. The loose chains imply constraints that may be challenged." },
  { name: "The Tower", number: "XVI", meaning: "Disruption, revelation, collapse of illusions.", reversedMeaning: "Fear of change, averting disaster, internal disruption, delayed upheaval.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_16_Tower.jpg`, imagery: "Lightning strikes a crown-topped tower as figures fall. Fire and dark sky show sudden upheaval and exposure." },
  { name: "The Star", number: "XVII", meaning: "Hope, clarity, renewal.", reversedMeaning: "Disillusionment, lost hope, cynicism, creative drought.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_17_Star.jpg`, imagery: "A kneeling figure pours water under a large star and seven smaller ones. The open night scene feels restorative and honest." },
  { name: "The Moon", number: "XVIII", meaning: "Uncertainty, dreams, deep intuition.", reversedMeaning: "Confusion easing, clarity emerging, facing buried fears slowly.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_18_Moon.jpg`, imagery: "A moon shines over a path between towers, with a dog, wolf, and crayfish. The image blends instinct, fear, and mystery." },
  { name: "The Sun", number: "XIX", meaning: "Vitality, joy, illumination.", reversedMeaning: "Temporary sadness, unrealistic optimism, delay of joy.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_19_Sun.jpg`, imagery: "A child rides a white horse beneath a bright sun and sunflowers. The scene radiates warmth, confidence, and openness." },
  { name: "Judgement", number: "XX", meaning: "Awakening, reckoning, calling.", reversedMeaning: "Self-doubt, refusal to hear the call, repeating old patterns.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_20_Judgement.jpg`, imagery: "An angel sounds a trumpet while people rise from coffins. The moment feels like an undeniable call to respond." },
  { name: "The World", number: "XXI", meaning: "Completion, integration, wholeness.", reversedMeaning: "Incompletion, loose ends, resistance to closure, unfinished business.", image: `${WIKIMEDIA_FILE}/RWS_Tarot_21_World.jpg`, imagery: "A dancer inside a laurel wreath holds two wands, surrounded by four creatures. The composition conveys closure and integration." }
];

const SUITS = [
  { name: "Wands", code: "Wands", meaning: "energy, action, motivation", imagery: "A staff-focused scene emphasizes drive, momentum, and creative fire." },
  { name: "Cups", code: "Cups", meaning: "emotion, relationships, intuition", imagery: "A cup-filled scene points to feeling, connection, and emotional truth." },
  { name: "Swords", code: "Swords", meaning: "thought, conflict, clarity", imagery: "Blades and stark posture draw attention to perspective, tension, and decision." },
  { name: "Pentacles", code: "Pents", meaning: "material life, work, stability", imagery: "Coins and grounded settings highlight resources, labor, and practical concerns." }
] as const;

const RANKS = [
  "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
  "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"
] as const;

const RANK_NUMBERS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Page", "Knight", "Queen", "King"] as const;

const rankImagery = (rank: string): string => {
  const map: Record<string, string> = {
    Ace: "A single emblem is presented prominently, suggesting a seed of potential entering awareness.",
    Two: "Two elements face each other, creating a visual tension between balance and choice.",
    Three: "A triad composition hints at expansion through collaboration or visible progress.",
    Four: "Stable geometry and resting posture suggest consolidation, boundaries, or pause.",
    Five: "The scene shows friction or disruption, drawing attention to stress and adaptation.",
    Six: "Movement from one state to another signals transition, exchange, or measured support.",
    Seven: "A reflective or defensive posture evokes assessment, strategy, and ambiguity.",
    Eight: "Repeated symbols imply discipline and process, with effort building over time.",
    Nine: "A solitary figure appears near culmination, carrying fatigue, caution, or attainment.",
    Ten: "The image reaches full saturation, suggesting completion, burden, or harvest.",
    Page: "A youthful figure engages curiously with the suit symbol, signaling messages and learning.",
    Knight: "A mounted figure directs momentum outward, expressing pursuit and intensity.",
    Queen: "A seated sovereign holds the suit symbol with receptivity and nuanced authority.",
    King: "A ruler embodies mastery of the suit's domain, emphasizing command and responsibility."
  };
  return map[rank];
};

/** Reversed meanings per rank index 0–13 for each suit (Ace–King). */
const MINOR_REVERSED_BY_SUIT: Record<string, string[]> = {
  Wands: [
    "Creative block, false starts, burnout, hesitation to take initiative.",
    "Fear of choices, poor planning, inner conflict, bad timing on next steps.",
    "Delays in plans, frustration, setbacks in expansion, teamwork friction.",
    "Restlessness at home, cancelled plans, instability, tension among allies.",
    "Hollow competition, avoiding conflict, inner chaos, petty rivalry.",
    "Arrogance, fall from favor, gossip, pride before a stumble.",
    "Giving up ground, overwhelm, defensiveness without strategy.",
    "Scattered hustle, delays, miscommunication, chaos in motion.",
    "Paranoia, stubborn isolation, exhaustion, refusing support.",
    "Burden crushing you, inability to delegate, collapse under responsibility.",
    "Immaturity, drama, bad news, unfocused enthusiasm.",
    "Reckless rushing, bullying energy, burnout from pointless haste.",
    "Jealousy, insecurity, demanding attention, low confidence masked as pride.",
    "Tyrannical leadership, impulsiveness, selfish direction, intimidation."
  ],
  Cups: [
    "Emotional blockage, repression, inability to open the heart.",
    "Tension in partnership, imbalance, secrets in love, poor compromise.",
    "Disappointment in celebration, creative slump, gossip in friendships.",
    "Instability at home, family friction, avoidance of emotional honesty.",
    "Regret after conflict, hollow victory in feelings, sensitivity overload.",
    "Stuck in nostalgia, living in the past, disappointment in return.",
    "Too many options, confusion in feelings, retreat into fantasy.",
    "Walking away prematurely, avoidance of deep feeling, escapism.",
    "Emotional exhaustion, anxiety, inability to set boundaries.",
    "Emotional collapse, family breakdown, burnout from caregiving.",
    "Emotional immaturity, melodrama, bad news in relationships.",
    "Mood swings, obsession, unrealistic romance, emotional rushing.",
    "Neediness, jealousy, emotional manipulation, drained generosity.",
    "Coldness, moody control, emotional rigidity or manipulative calm."
  ],
  Swords: [
    "Mental fog, brutal clarity delayed, harsh words held back wrongly.",
    "Stalemate, impossible choices, emotional deadlock, denial of truth.",
    "Heartbreak from words, cruel gossip, confusion after truth surfaces.",
    "Restlessness without rest, mental burnout, argument loops.",
    "Hollow victory, bullying, deceit, shame after a win.",
    "Stalemate on travel, delayed news, relief edged with compromise.",
    "Giving up too soon, sneak attacks, unfair advantage, paranoia.",
    "Mental paralysis, trapped thinking, inability to move ideas forward.",
    "Mental anguish that lingers, harsh self-criticism, sleepless worry.",
    "Betrayal exposed, ruin from lies, rock bottom that forces honesty.",
    "Gossip, surveillance, spurious information, mental restlessness.",
    "Thrillseeking conflict, verbal brutality, charging into needless fights.",
    "Bitterness, cold judgment, resentment dressed as logic.",
    "Tyranny of ideas, verbal cruelty, rigidity, intellectual domination."
  ],
  Pentacles: [
    "Missed opportunity in work or money, poor planning, instability at the start.",
    "Imbalance in money or priorities, partnership stress over resources.",
    "Work overload, stalled projects, friction in collaborative effort.",
    "Conservatism turned greedy, fear-based hoarding, tension over security.",
    "Poverty mindset after conflict, charity with strings, stress over scraps.",
    "Generosity without boundaries, delayed payoff, imbalance in giving.",
    "Overwork without reward, fear of scarcity, guarded hoarding.",
    "Hidden skill not shared, impostor feelings, skill without opportunity.",
    "Hoarding anxiety, greed, fear of loss, work without rest.",
    "Financial or workload collapse, family stress over burdens, debt pressure.",
    "Irresponsibility with money, bad deals, learning through costly errors.",
    "Workaholic neglect, ruthless ambition, burnout chasing status.",
    "Smothering practicality, anxiety about security, envy of others' success.",
    "Materialism, rigidity in leadership, neglect of people for profit."
  ]
};

const minorArcana: Omit<TarotCard, "id">[] = SUITS.flatMap((suit) =>
  RANKS.map((rank, i) => ({
    name: `${rank} of ${suit.name}`,
    number: RANK_NUMBERS[i],
    meaning: `${rank} of ${suit.name} themes: ${suit.meaning}.`,
    reversedMeaning: MINOR_REVERSED_BY_SUIT[suit.name][i],
    image: `${WIKIMEDIA_FILE}/${suit.code}${String(i + 1).padStart(2, "0")}.jpg`,
    imagery: `${rankImagery(rank)} ${suit.imagery}`
  }))
);

export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...minorArcana].map(
  (card, index) => ({ ...card, id: index })
);

export const MODES: Record<ModeId, ModeConfig> = {
  oracle: {
    id: "oracle",
    name: "Oracle Mode",
    roleLabel: "Oracle",
    shortLabel: "Oracle",
    frictionLabel: "Low Friction",
    icon: "🔮",
    color: "#8b6ba5",
    description:
      "AI delivers a complete, authoritative interpretation. You evaluate whether the meaning resonates.",
    hint: "The AI provides a complete interpretation. Reflect on whether it resonates.",
    initialTrigger: "Please give me your reading.",
    inputPlaceholder: "Share your thoughts or ask a follow-up..."
  },
  dialogue: {
    id: "dialogue",
    name: "Dialogue Mode",
    roleLabel: "Co-interpreter",
    shortLabel: "Dialogue",
    frictionLabel: "Medium Friction",
    icon: "💬",
    color: "#5b7fa5",
    description:
      "AI offers multiple distinct interpretations and puzzles through them with you. You compare, select, and reflect.",
    hint: "The AI offers multiple lenses. Compare them — explore why one fits better.",
    initialTrigger: "Please give me your reading.",
    inputPlaceholder: "Which interpretation speaks to you, and why?"
  },
  mirror: {
    id: "mirror",
    name: "Mirror Mode",
    roleLabel: "Mirror",
    shortLabel: "Mirror",
    frictionLabel: "High Friction",
    icon: "🪞",
    color: "#4a7c6f",
    description:
      "AI asks only questions — never interprets. You construct your own meaning through guided self-reflection.",
    hint: "The AI only asks questions. The meaning is yours to construct.",
    initialTrigger: "I've drawn my card. Please begin.",
    inputPlaceholder: "Share what you see or feel..."
  }
};
