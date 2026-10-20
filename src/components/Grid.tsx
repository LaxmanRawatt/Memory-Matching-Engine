import React from 'react';
import { CardItem } from '../types/game';
import { Card } from './Card';

interface GridProps {
  cards: CardItem[];
  cols: number;
  isLocked: boolean;
  onCardClick: (index: number) => void;
}

export const Grid: React.FC<GridProps> = ({ cards, cols, isLocked, onCardClick }) => {
  // Determine dynamic grid columns class
  const getGridColsClass = () => {
    switch (cols) {
      case 5:
        return 'grid-cols-4 sm:grid-cols-5 max-w-3xl';
      case 6:
        return 'grid-cols-4 sm:grid-cols-6 max-w-4xl';
      case 4:
      default:
        return 'grid-cols-4 max-w-2xl';
    }
  };

  return (
    <div className="w-full flex justify-center py-4 px-2">
      <div
        className={`grid gap-3 sm:gap-4 w-full ${getGridColsClass()} mx-auto transition-all duration-300`}
        role="group"
        aria-label="Memory Card Matching Grid"
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            isLocked={isLocked}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};
