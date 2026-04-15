import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CardDraw } from "./pages/CardDraw";
import { ModeSelect } from "./pages/ModeSelect";
import { Reading } from "./pages/Reading";
import { TAROT_DECK } from "./constants";
import type { CardOrientation, ModeId, TarotCard } from "./types";

type AppPage = "mode-select" | "card-draw" | "reading";

const pickRandomDraw = (): { card: TarotCard; orientation: CardOrientation } => {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const card = TAROT_DECK[buf[0] % TAROT_DECK.length];
  const orientation: CardOrientation = buf[1] % 2 === 0 ? "upright" : "reversed";
  return { card, orientation };
};

function App() {
  const [page, setPage] = useState<AppPage>("mode-select");
  const [mode, setMode] = useState<ModeId | null>(null);
  const [inquiry, setInquiry] = useState("");
  const [draw, setDraw] = useState<{
    card: TarotCard;
    orientation: CardOrientation;
  } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const reset = () => {
    setPage("mode-select");
    setMode(null);
    setInquiry("");
    setDraw(null);
    setSelectedSlot(null);
  };

  return (
    <div className="app-shell">
      {page !== "mode-select" && (
        <nav className="top-nav">
          <button onClick={reset}>← Start Over</button>
          <span>INTERPRETIVE FRICTION</span>
        </nav>
      )}

      <AnimatePresence mode="wait">
        {page === "mode-select" && (
          <ModeSelect
            selectedMode={mode}
            onSelect={setMode}
            onContinue={() => mode && setPage("card-draw")}
          />
        )}

        {page === "card-draw" && mode && (
          <CardDraw
            mode={mode}
            inquiry={inquiry}
            selectedCard={draw?.card ?? null}
            orientation={draw?.orientation ?? "upright"}
            selectedSlot={selectedSlot}
            onInquiryChange={setInquiry}
            onDraw={(index) => {
              setSelectedSlot(index);
              setDraw(pickRandomDraw());
            }}
            onBegin={() => setPage("reading")}
          />
        )}

        {page === "reading" && mode && draw && (
          <Reading
            mode={mode}
            card={draw.card}
            orientation={draw.orientation}
            inquiry={inquiry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
