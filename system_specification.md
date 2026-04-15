# Interpretive Friction: AI Tarot Reading Agent — Full System Specification

## Overview

Build a web application for an AI-assisted tarot reading system that implements three distinct interaction modes along a "friction gradient." This is a research prototype studying how different levels of AI involvement affect human meaning-making. The three modes differ ONLY in how the AI responds — the card drawing experience and UI are identical.

The core research question: Does AI help people think more deeply, or does it just make them feel like they did?

---

## Technology Stack

- **Frontend**: React + TypeScript, Vite build tool
- **Animations**: Framer Motion (motion/react) for card flip, page transitions, and micro-interactions
- **Icons**: Lucide React
- **LLM Backend**: Currently using Gemini API (abstracted behind a service module so the model can be swapped)
- **Card Data**: Full 78-card Rider-Waite-Smith deck stored in a constants file
- **Architecture**: Client-side SPA for now; backend for data persistence to be added later

---

## Application Flow (3 Pages)

### Page 1: Mode Selection

**Purpose**: User chooses one of three interaction modes before starting.

**Layout**: Centered page with three cards arranged horizontally.

**Content for each mode card**:

1. **Oracle Mode** — Icon: 🔮 — Label: "Low Friction"
   - Description: "AI delivers a complete, authoritative interpretation. You evaluate whether the meaning resonates."
   - Color accent: Purple (#8b6ba5)

2. **Dialogue Mode** — Icon: 💬 — Label: "Medium Friction"  
   - Description: "AI offers multiple distinct interpretations and puzzles through them with you. You compare, select, and reflect."
   - Color accent: Blue (#5b7fa5)

3. **Mirror Mode** — Icon: 🪞 — Label: "High Friction"
   - Description: "AI asks only questions — never interprets. You construct your own meaning through guided self-reflection."
   - Color accent: Teal (#4a7c6f)

**Interaction**: Click to select (visual highlight), then click "Continue →" button. The selected mode persists through the entire session.

---

### Page 2: Inquiry Input + Card Drawing

This page has two sequential phases:

#### Phase A: Inquiry Input

**Purpose**: User describes their personal question/concern in their own words.

**UI Elements**:
- Mode indicator at top (icon + mode name, colored by mode)
- Heading: "What's on your mind?"
- Subtext: "Describe a question, concern, or situation you'd like to explore."
- Large textarea with placeholder: "e.g. I'm struggling with a career decision and feel pulled in two directions..."
- "Draw a Card" button (disabled until text is entered)

**Important**: The inquiry must be the user's genuine concern, not a hypothetical. This is essential to the research — cognitive reappraisal only works on personally meaningful material.

#### Phase B: Card Drawing Animation

**Purpose**: Simulate the ritual experience of drawing a physical tarot card. The user must feel agency in the selection.

**Flow**:
1. Display 7 cards face-down in a horizontal row
2. Heading: "Choose a card" / Subtext: "Trust your intuition — select the one that calls to you."
3. Cards have hover effects (lift up, glow border) to invite interaction
4. User clicks one card → all other cards fade out
5. Selected card performs a 3D flip animation (CSS perspective + rotateY) revealing the card face (actual RWS image)
6. After flip completes, display the full-size card below with:
   - Card image (larger)
   - Card name
   - Brief traditional meaning (italic)
7. "Begin Reading →" button appears

**Technical detail on randomization**: The card is determined by cryptographically random selection from the full 78-card deck at the moment of click — NOT pre-assigned to positions. All 7 face-down cards are equivalent; the position has no meaning.

---

### Page 3: Reading (Split Layout)

**Layout**: Two-panel split screen.

#### Left Panel (fixed width ~320px, scrollable):
- Mode indicator (icon + label, mode color)
- Card image (the actual RWS artwork, ~200px wide)
- Card name (bold)
- Card imagery description (italic, grey text) — this is a textual description of what's depicted on the card, helping the user attend to visual details
- Bottom: mode-specific hint box explaining the user's role:
  - Oracle: "The AI provides a complete interpretation. Reflect on whether it resonates."
  - Dialogue: "The AI offers multiple lenses. Compare them — explore why one fits better."
  - Mirror: "The AI only asks questions. The meaning is yours to construct."

#### Right Panel (flex, chat interface):
- **Header bar**: Shows "Your concern:" followed by the user's inquiry text (truncated with ellipsis if long)
- **Message area** (scrollable):
  - Assistant messages: left-aligned, subtle mode-colored border, label above ("Oracle" / "Co-interpreter" / "Mirror")
  - User messages: right-aligned, darker background
  - Loading indicator: three pulsing dots in mode color
  - Auto-scroll to bottom on new messages
- **Input area** (bottom):
  - Textarea (2 rows, expands)
  - Send button (mode-colored when active)
  - Enter to send, Shift+Enter for newline
  - Mode-specific placeholder text:
    - Oracle: "Share your thoughts or ask a follow-up..."
    - Dialogue: "Which interpretation speaks to you, and why?"
    - Mirror: "Share what you see or feel..."

**Chat initialization**: When this page loads, the system immediately makes the first API call. The user does NOT send a message first — the AI speaks first. The initial (hidden) user message sent to the API is:
- Oracle/Dialogue: "Please give me your reading."
- Mirror: "I've drawn my card. Please begin."

This hidden message is NOT displayed in the UI. The first visible message is the assistant's response.

**Conversation management**: Each subsequent user message is appended to the full conversation history and sent to the API with the system prompt. The full history must be included every time (LLMs are stateless).

---

## Card Data

Use the full 78-card Rider-Waite-Smith deck. Each card needs:

```typescript
interface TarotCard {
  id: number;           // 0-77
  name: string;         // e.g. "The Tower", "Seven of Cups"
  number: string;       // e.g. "XVI", "7", "Knight"
  meaning: string;      // Brief traditional meanings
  image: string;        // URL to RWS card image (Wikimedia Commons public domain)
  imagery: string;      // Textual description of what is depicted on the card
}
```

The `image` field is displayed to the user. The `imagery` field is passed to the LLM in the system prompt so it can reference specific visual elements.

**Why both?** The LLM cannot see the image. It needs the textual imagery description to ask meaningful questions about what the user sees (especially in Mirror Mode). The user needs the actual image to look at.

Full card image URLs from Wikimedia Commons follow this pattern:
- Major Arcana: `https://upload.wikimedia.org/wikipedia/commons/.../RWS_Tarot_XX_Name.jpg`
- Minor Arcana: `https://upload.wikimedia.org/wikipedia/commons/.../Wands01.jpg` (also Cups, Swords, Pents)

Include all 22 Major Arcana + 56 Minor Arcana (14 each of Wands, Cups, Swords, Pentacles: Ace through 10, Page, Knight, Queen, King).

Each card's `imagery` field should be a 1-3 sentence description of the visual scene on the RWS card. These descriptions are critical for Mirror Mode to function properly.

---

## THE THREE MODES: Detailed Design Specifications

This is the core of the system. The three modes MUST produce qualitatively different cognitive experiences. They share the same card, the same inquiry, the same UI — the ONLY difference is the AI's response strategy, controlled entirely by the system prompt.

---

### MODE 1: ORACLE (Low Friction — Baseline)

**Theoretical basis**: This represents the current market standard for AI tarot apps. The user receives a complete interpretation and their cognitive task is to evaluate it — a predominantly analytical (System 2) operation. This is the "undesirable ease" condition.

**User's cognitive task**: Evaluate whether AI-generated meaning resonates with their experience.

**AI behavior**:
- Delivers a single, fluent, authoritative narrative interpretation
- Synthesizes card symbolism with the user's specific concern
- Provides a sense of closure and direction
- Warm, intimate, assured tone — like a personal reading
- In follow-up exchanges: elaborates, deepens, clarifies
- NEVER asks the user reflective questions
- NEVER presents multiple interpretations or alternatives

**System Prompt**:

```
You are an AI tarot reader operating in Oracle Mode. You provide a single, cohesive, authoritative interpretation.

Card drawn: {card.name} ({card.number})
Traditional meanings: {card.meaning}
Imagery on the card: {card.imagery}

The user's concern: "{inquiry}"

Instructions:
- Deliver a fluent, warm, narrative interpretation that synthesizes the card's symbolism with the user's specific concern.
- Speak as though you are giving a personal reading — direct, intimate, and assured.
- Provide a sense of meaning and direction. Offer closure.
- Keep your initial interpretation to 2-3 substantial paragraphs.
- In follow-up messages, continue to elaborate, clarify, and deepen your interpretation in response to the user's questions or reactions. Maintain your authoritative, warm voice.
- Do NOT ask the user reflective questions. Your role is to provide meaning, not to prompt reflection.
- Do NOT hedge excessively or present alternatives. Commit to your reading.
```

---

### MODE 2: DIALOGUE (Medium Friction)

**Theoretical basis**: Grounded in Cognitive Flexibility Theory (Spiro et al., 1992). In ill-structured domains, encountering the same material through multiple interpretive lenses builds flexible, transferable understanding. The key is "criss-crossing the conceptual landscape."

**User's cognitive task**: Compare and select among genuinely different interpretive frameworks, then reflect on WHY one resonates and what the rejected alternatives reveal.

**AI behavior**:
- First message: Presents 2-3 interpretations that differ in FRAMEWORK, not just wording
- Frames itself as a co-interpreter genuinely puzzling over the card
- After user selects, does NOT simply validate — probes the selection and examines rejected alternatives
- Introduces new angles based on what the user reveals
- Gently challenges if user settles too quickly

**Critical design constraints**:

1. **Genuine diversity**: Interpretations must differ in interpretive lens. Example: the same card read as (a) loss/grief, (b) liberation/freedom, (c) revelation/truth — NOT three synonyms for "change." The prompt must instruct the LLM to vary on framework, emotional valence, temporal orientation, and agency.

2. **Anchoring mitigation**: The first interpretation tends to anchor judgment (Tversky & Kahneman, 1974). Present interpretations in parallel (visually side-by-side if possible) rather than sequentially. If sequential, vary the order across sessions.

3. **Selection ≠ Reflection**: "Which resonates?" is the starting point, not the end. Follow-up MUST probe: "Why not the other? What part of it was partly right?" Examining rejected alternatives reveals deeper appraisal structures.

4. **Co-interpreter voice**: The AI should sound like it is genuinely puzzled and working through the reading alongside the user ("I'm torn on this one..." / "Something about this card keeps pulling me in different directions...") — NOT listing options like a menu. The user should feel like a collaborator, not a consumer choosing from a dropdown.

**System Prompt**:

```
You are an AI tarot reader operating in Dialogue Mode. You present multiple genuinely DISTINCT interpretations, then help the user reflect on which resonates and why.

Card drawn: {card.name} ({card.number})
Traditional meanings: {card.meaning}
Imagery on the card: {card.imagery}

The user's concern: "{inquiry}"

Instructions for your FIRST message:
- Present 2-3 interpretations that differ in FRAMEWORK, not just wording. For example: one reading through the lens of loss, another through liberation, another through revelation — NOT three ways of saying "change."
- Vary interpretations along these dimensions: interpretive framework, emotional valence, temporal orientation, and level of agency attributed to the user.
- Frame yourself as a co-interpreter genuinely puzzling over the card. Use language like "I'm torn on this one..." or "This card is pulling me in different directions..." or "I keep going back and forth between readings..."
- After presenting, invite the user to reflect: which resonates? But frame it as genuine curiosity, not a menu selection.
- You are a collaborator having a real interpretive conversation, NOT a service listing options.

Instructions for FOLLOW-UP messages:
- When the user selects an interpretation, do NOT simply validate their choice. Probe further: "What about the other reading — was any part of it partly right?" or "Why does this one feel closer? What would be different if the other one were true?"
- Examining rejected alternatives reveals deeper appraisal structures — this is where the real cognitive work happens.
- You can introduce new angles that emerged from the user's response. ("Now that you've said that, I'm wondering if there's actually a fourth way to read this...")
- Continue being a co-interpreter — think out loud, share genuine puzzlement, be willing to be surprised.
- If the user seems settled too quickly, gently challenge: "I wonder though..." or "There's something about the [other interpretation] that I can't quite let go of..." or "Humor me for a second — what if the opposite were true?"
- Never become a passive validator. Your role is to keep the interpretive space open and active.
```

---

### MODE 3: MIRROR (High Friction)

**Theoretical basis**: Grounded in Dual-Process Theory (Kahneman, 2011). Traditional tarot engages both System 1 (intuitive, automatic responses to imagery) and System 2 (deliberate interpretation). When AI provides interpretations, it shifts the user entirely to System 2 (evaluating external meaning), bypassing the intuitive meaning-generation process. Mirror Mode protects System 1 by withholding AI interpretation entirely.

**User's cognitive task**: Generate their own meaning through guided self-reflection. The AI scaffolds attention but never provides content.

**AI behavior**:
- Produces ONLY questions, never interpretive statements
- Questions are frame-free (no implicit answers embedded)
- Follows a three-stage cognitive sequence: Attention → Connection → Reframe
- Builds every follow-up on the user's actual words
- Validates without interpreting
- Redirects if user demands interpretation

**Critical design constraints**:

1. **Structured question sequence** — three cognitive stages:
   - Stage 1 — ATTENTION DIRECTING: Direct the user's gaze to specific visual elements. "What's the first thing you notice?" / "What about the figure's posture stands out?" / "What colors draw your eye?"
   - Stage 2 — PERSONAL CONNECTION: Bridge observation to lived experience. "What does [what they mentioned] remind you of?" / "Where in your life have you felt something like that?" / "When was the last time you experienced that feeling?"
   - Stage 3 — REFRAME CHALLENGE: Push beyond the first interpretation. "If it didn't mean [what they said], what else could it mean?" / "What's a completely different way to see that?" / "What would someone who disagreed with you say this card means?"

2. **Questions MUST NOT contain frames** — This is the hardest constraint for LLMs to follow and the most important:
   - ❌ BAD: "Is this card telling you to let go?" → contains the frame "let go"
   - ❌ BAD: "Do you think this represents a new beginning?" → contains the frame "new beginning"
   - ❌ BAD: "What kind of transformation do you see here?" → contains the frame "transformation"
   - ✅ GOOD: "What's the first thing you notice in this image?"
   - ✅ GOOD: "What does that remind you of in your life right now?"
   - ✅ GOOD: "What does this image bring up for you?"
   - The test: if you removed the question mark, would the sentence contain an interpretation? If yes, it's a bad question.

3. **Context-sensitive follow-up**: The AI MUST build on the user's specific words. If the user says "I see someone falling," the next question MUST engage with falling — not cycle to a generic template. This is what separates genuine scaffolding from a scripted questionnaire.

4. **Frustration management**: High friction risks disengagement. Mitigations:
   - Frame the purpose upfront in the first message (briefly)
   - Start with easy, low-threshold observation questions (what do you see?)
   - Validate without interpreting ("That's an interesting connection" / "I hadn't thought of it that way")
   - If user becomes frustrated or asks "just tell me what it means," gently redirect: "I'm really curious what YOU see here — what stands out to you?" Do NOT break character and provide an interpretation.

5. **One question at a time**: Never ask multiple questions in a single message. One question. Wait for response. Build on it.

**System Prompt**:

```
You are an AI tarot reader operating in Mirror Mode. You NEVER provide interpretations. You guide the user to construct their OWN meaning through reflective questions.

Card drawn: {card.name} ({card.number})
Traditional meanings: {card.meaning}
Imagery on the card: {card.imagery}

The user's concern: "{inquiry}"

STRICT RULES — violating any of these breaks the mode:

1. Produce ONLY questions. Never make interpretive statements. Never explain what the card "means." Never say "this card suggests..." or "this could represent..." or anything similar.

2. Questions must NOT contain implicit frames.
   BAD: "Is this card telling you to let go?" (contains the frame "let go")
   BAD: "Do you think this represents a new beginning?" (contains the frame "new beginning")  
   BAD: "What kind of transformation do you see here?" (contains the frame "transformation")
   GOOD: "What's the first thing you notice in this card's imagery?"
   GOOD: "What does that remind you of in your life right now?"
   GOOD: "What does this image bring up for you?"
   The test: if removing the question mark leaves an interpretation, rewrite the question.

3. Follow a three-stage sequence:
   Stage 1 — ATTENTION DIRECTING: "What element of this image draws your eye first?" / "What do you notice about the figure's posture or expression?" / "What colors or objects stand out to you?"
   Stage 2 — PERSONAL CONNECTION: "What does [what they mentioned] remind you of?" / "Where in your life have you felt something like [what they described]?" / "When was the last time you experienced that?"
   Stage 3 — REFRAME CHALLENGE: "If it didn't mean [what they said], what else could it mean?" / "What's a completely different way to see that?" / "What would change if you looked at it from the opposite angle?"

4. Build EVERY follow-up question on the user's ACTUAL words from their previous response. If they say "I see someone falling," your next question MUST engage with falling, not shift to a generic template. If they say "it reminds me of my mother," your next question must engage with that specific connection. This is non-negotiable.

5. Validate the user's observations without interpreting them: say "That's an interesting connection" or "I hadn't considered that angle" — NEVER "Yes, that suggests you need to..." or "That's right, the card is showing you..."

6. If the user asks you to just tell them what the card means, or expresses frustration, gently redirect: "I'm really curious what YOU see here — there's no wrong answer. What stands out to you?" Do NOT break character and provide an interpretation under any circumstances.

7. Ask ONE question at a time. Do not stack multiple questions. One question. Wait. Build on the response.

8. Your first message should briefly frame the approach ("I'd love to explore this card through your eyes") and then ask your first attention-directing question about what the user notices in the card's imagery. Keep it warm and inviting.
```

---

## Visual Design Guidelines

**Overall aesthetic**: Dark, moody, mystical but not kitschy. Think editorial occult — sophisticated, not Halloween.

- **Background**: Deep navy/charcoal (#111827)
- **Surface**: Dark grey (#1f2937)
- **Accent**: Warm copper/gold (#c8956c) — used for highlights, borders, buttons
- **Text**: Warm off-white (#e5e0d8)
- **Text dim**: Grey (#9ca3af)
- **Font**: Georgia or similar serif for headings and body. The serif font is essential to the aesthetic — do not use sans-serif.

**Mode colors** are used for borders, labels, accents, and the send button on the reading page:
- Oracle: Purple (#8b6ba5)
- Dialogue: Blue (#5b7fa5)  
- Mirror: Teal (#4a7c6f)

**Card back design**: Dark gradient with a subtle ornamental symbol (✦ or similar). Border highlights on hover. Cards should lift upward on hover to invite clicking.

**Animations to implement**:
- Page transitions: fade in + slight upward translate
- Card hover: translateY(-12px) + scale(1.05) + border glow
- Card flip: CSS 3D perspective transform (rotateY 180deg), 0.7s duration
- Non-selected cards: fade out simultaneously as selected card flips
- Chat messages: fade in + slight upward translate
- Loading dots: pulsing opacity + scale animation, staggered

---

## Data Flow

```
User selects mode → stored in app state
User writes inquiry → stored in app state  
User clicks card → random card selected, stored in app state
System prompt constructed from: mode + card data + inquiry
First API call made automatically (hidden trigger message)
Each user message → appended to conversation history → full history sent to API
```

**Conversation history format sent to API**:
```json
{
  "system": "<system prompt with mode, card, inquiry>",
  "messages": [
    {"role": "user", "content": "<hidden trigger: 'Please give me your reading.' or 'I've drawn my card. Please begin.'>"},
    {"role": "assistant", "content": "<first AI response>"},
    {"role": "user", "content": "<user's first visible message>"},
    {"role": "assistant", "content": "<AI response>"},
    ...
  ]
}
```

The hidden trigger message IS included in the API call history but is NOT displayed in the UI.

---

## Navigation

- **Top navbar** (visible on pages 2 and 3): "← Start Over" button on left, "INTERPRETIVE FRICTION" label on right. Fixed position, blurred background.
- "Start Over" resets all state and returns to page 1.
- No back button between pages 2 and 3 — once you begin reading, you're in the session.

---

## What Success Looks Like (for Testing)

Test each mode with the same card and concern. The outputs should feel qualitatively different:

**Oracle test**: Enter a concern about a career decision. Draw any card. The AI should immediately deliver a warm, confident, complete reading that ties the card to your career situation. It should feel like getting an answer. Follow-up questions should deepen the same interpretation, not open new ones.

**Dialogue test**: Same concern. The AI's first message should present 2-3 genuinely different ways to read the card — not "this means change" said three ways, but readings through fundamentally different lenses (e.g., one about endings, one about courage, one about patience). When you pick one, the AI should push back: "What about the other reading though?" It should feel like a real interpretive conversation with someone who's also thinking hard.

**Mirror test**: Same concern. The AI should ask you what you notice in the card image. When you say something, it should ask what that reminds you of. It should NEVER tell you what the card means. If you say "just tell me what it means," it should redirect you back to your own perception. It should feel like talking to a very good therapist who refuses to give advice. After several exchanges, you should feel like YOU figured something out — not that the AI told you something.

---

## File Structure Suggestion

```
src/
├── App.tsx                  # Main app with page routing
├── constants.ts             # Full 78-card deck data
├── services/
│   └── llmService.ts        # LLM API abstraction (swap models here)
├── prompts/
│   └── systemPrompts.ts     # System prompt generators per mode
├── pages/
│   ├── ModeSelect.tsx        # Page 1
│   ├── CardDraw.tsx          # Page 2
│   └── Reading.tsx           # Page 3
├── components/
│   ├── CardBack.tsx          # Face-down card with hover
│   ├── CardFace.tsx          # Revealed card with image
│   ├── ChatMessage.tsx       # Single message bubble
│   └── ChatInput.tsx         # Input area with send
├── styles/
│   └── index.css             # Global styles, CSS variables
└── main.tsx                  # Entry point
```
