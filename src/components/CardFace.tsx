import type { CardOrientation, TarotCard } from "../types";

interface CardFaceProps {
  card: TarotCard;
  orientation: CardOrientation;
}

export const CardFace = ({ card, orientation }: CardFaceProps) => (
  <article className="card-face">
    <img
      src={card.image}
      alt={card.name}
      className={orientation === "reversed" ? "card-img--reversed" : undefined}
    />
    <h3>{card.name}</h3>
    <p className="card-orientation-label">
      {orientation === "upright" ? "Upright" : "Reversed"}
    </p>
  </article>
);
