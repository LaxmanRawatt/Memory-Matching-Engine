import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, act } from '@testing-library/react';
import App from '../App';

describe('PS09 Core Game Mechanics & State Correctness Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders a 4 by 4 grid containing 16 cards (eight pairs) on initial load', () => {
    render(<App />);

    // Check 16 card elements exist
    for (let i = 0; i < 16; i++) {
      const card = screen.getByTestId(`card-${i}`);
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('data-card-state', 'hidden');
    }

    // Check starting pair count is 8
    expect(screen.getByText('/ 8')).toBeInTheDocument();
  });

  it('demonstrates a match: two identical cards remain permanently revealed and increment matched pairs', () => {
    render(<App />);

    const card0 = screen.getByTestId('card-0');
    const pair0Id = card0.getAttribute('data-pair-id');

    let matchingIndex = -1;
    for (let i = 1; i < 16; i++) {
      if (screen.getByTestId(`card-${i}`).getAttribute('data-pair-id') === pair0Id) {
        matchingIndex = i;
        break;
      }
    }
    expect(matchingIndex).toBeGreaterThan(0);

    const matchCard = screen.getByTestId(`card-${matchingIndex}`);

    // Click first card
    act(() => {
      card0.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // Click matching second card
    act(() => {
      matchCard.click();
    });

    // Both cards should be marked 'matched'
    expect(card0).toHaveAttribute('data-card-state', 'matched');
    expect(matchCard).toHaveAttribute('data-card-state', 'matched');

    // Verify matched cards have aria-label indicating matched
    expect(card0).toHaveAttribute('aria-label', expect.stringContaining('(Matched)'));
  });

  it('demonstrates a mismatch: flips two different cards, locks board, and flips back after mismatch delay', () => {
    render(<App />);

    const card0 = screen.getByTestId('card-0');
    const pair0Id = card0.getAttribute('data-pair-id');

    // Find a card with a different pairId
    let mismatchIndex = -1;
    for (let i = 1; i < 16; i++) {
      if (screen.getByTestId(`card-${i}`).getAttribute('data-pair-id') !== pair0Id) {
        mismatchIndex = i;
        break;
      }
    }
    const mismatchCard = screen.getByTestId(`card-${mismatchIndex}`);

    // Click first card
    act(() => {
      card0.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // Click second (differing) card
    act(() => {
      mismatchCard.click();
    });

    // Both should enter 'mismatched' state
    expect(card0).toHaveAttribute('data-card-state', 'mismatched');
    expect(mismatchCard).toHaveAttribute('data-card-state', 'mismatched');

    // Advance time past the 850ms mismatch delay
    act(() => {
      vi.advanceTimersByTime(900);
    });

    // Both cards should revert to hidden
    expect(card0).toHaveAttribute('data-card-state', 'hidden');
    expect(mismatchCard).toHaveAttribute('data-card-state', 'hidden');
  });

  it('demonstrates rapid clicks: strictly prevents a 3rd selection while two unmatched cards are being resolved', () => {
    render(<App />);

    const card0 = screen.getByTestId('card-0');
    const pair0Id = card0.getAttribute('data-pair-id');

    let mismatchIndex = -1;
    let thirdIndex = -1;

    for (let i = 1; i < 16; i++) {
      const pId = screen.getByTestId(`card-${i}`).getAttribute('data-pair-id');
      if (pId !== pair0Id) {
        if (mismatchIndex === -1) {
          mismatchIndex = i;
        } else if (thirdIndex === -1) {
          thirdIndex = i;
          break;
        }
      }
    }

    const card1 = screen.getByTestId(`card-${mismatchIndex}`);
    const card2 = screen.getByTestId(`card-${thirdIndex}`);

    // Step 1: Click card 0
    act(() => {
      card0.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // Step 2: Click card 1 (triggers mismatch and activates isLocked)
    act(() => {
      card1.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'mismatched');
    expect(card1).toHaveAttribute('data-card-state', 'mismatched');

    // Step 3: Rapidly attempt to click card 2 while resolution lock is active
    act(() => {
      card2.click();
    });

    // The 3rd card MUST remain 'hidden' because isLocked rejected the selection!
    expect(card2).toHaveAttribute('data-card-state', 'hidden');

    // Complete mismatch resolution timeout
    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(card0).toHaveAttribute('data-card-state', 'hidden');
    expect(card1).toHaveAttribute('data-card-state', 'hidden');
    expect(card2).toHaveAttribute('data-card-state', 'hidden');
  });

  it('handles repeat clicks on the same card and clicks on already matched cards idempotently', () => {
    render(<App />);

    const card0 = screen.getByTestId('card-0');

    // 1. Click first card
    act(() => {
      card0.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // 2. Click the SAME card again (repeat click)
    act(() => {
      card0.click();
    });
    // Should still be flipped, moves should NOT increase
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // 3. Complete match with its pair
    const pair0Id = card0.getAttribute('data-pair-id');
    let matchingIndex = -1;
    for (let i = 1; i < 16; i++) {
      if (screen.getByTestId(`card-${i}`).getAttribute('data-pair-id') === pair0Id) {
        matchingIndex = i;
        break;
      }
    }
    const matchCard = screen.getByTestId(`card-${matchingIndex}`);
    act(() => {
      matchCard.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'matched');

    // 4. Click already matched card
    act(() => {
      card0.click();
      matchCard.click();
    });
    // Both remain matched with no errors or move changes
    expect(card0).toHaveAttribute('data-card-state', 'matched');
    expect(matchCard).toHaveAttribute('data-card-state', 'matched');
  });

  it('demonstrates restart during a pending timer: cancels callbacks so old game actions cannot affect new game', () => {
    render(<App />);

    const card0 = screen.getByTestId('card-0');
    const pair0Id = card0.getAttribute('data-pair-id');

    let mismatchIndex = -1;
    for (let i = 1; i < 16; i++) {
      if (screen.getByTestId(`card-${i}`).getAttribute('data-pair-id') !== pair0Id) {
        mismatchIndex = i;
        break;
      }
    }
    const cardMismatch = screen.getByTestId(`card-${mismatchIndex}`);

    // Click card 0
    act(() => {
      card0.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'flipped');

    // Click card mismatch
    act(() => {
      cardMismatch.click();
    });
    expect(card0).toHaveAttribute('data-card-state', 'mismatched');

    // Advance 200ms into the 850ms mismatch timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Press restart button while timer is active
    const restartBtn = screen.getByRole('button', { name: /restart/i });
    act(() => {
      restartBtn.click();
    });

    // All cards in new game are hidden
    const newCard0 = screen.getByTestId('card-0');
    expect(newCard0).toHaveAttribute('data-card-state', 'hidden');

    // Advance 1200ms (past the original timer's scheduled execution)
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    // Verify state was NOT mutated by the canceled old timer
    expect(newCard0).toHaveAttribute('data-card-state', 'hidden');
    expect(screen.queryByText(/Round Cleared/i)).not.toBeInTheDocument();
  });
});
