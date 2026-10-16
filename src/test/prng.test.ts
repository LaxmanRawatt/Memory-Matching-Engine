import { describe, it, expect } from 'vitest';
import { createPRNG, stringToSeed, shuffleArray, generateRandomSeed } from '../utils/prng';
import { generateDeck } from '../utils/cardDefinitions';

describe('PRNG & Deck Reproducibility Suite', () => {
  it('produces identical pseudo-random numbers given the exact same seed', () => {
    const seed = 'TEST-REPRODUCIBLE-SEED-42';
    const prng1 = createPRNG(seed);
    const prng2 = createPRNG(seed);

    const stream1 = Array.from({ length: 10 }, () => prng1());
    const stream2 = Array.from({ length: 10 }, () => prng2());

    expect(stream1).toEqual(stream2);
  });

  it('produces different streams for distinct seeds', () => {
    const prngA = createPRNG('SEED-ALPHA');
    const prngB = createPRNG('SEED-BETA');

    const streamA = Array.from({ length: 5 }, () => prngA());
    const streamB = Array.from({ length: 5 }, () => prngB());

    expect(streamA).not.toEqual(streamB);
  });

  it('shuffles arrays deterministically with identical seeds', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const seed = 'SHUFFLE-SEED-123';

    const shuffled1 = shuffleArray(items, createPRNG(seed));
    const shuffled2 = shuffleArray(items, createPRNG(seed));

    expect(shuffled1).toEqual(shuffled2);
    // Preserves all items
    expect([...shuffled1].sort((a, b) => a - b)).toEqual(items);
  });

  it('generates a 4x4 grid containing eight pairs (16 cards) consistently for a seed', () => {
    const seed = 'CEREVYN-BASE-4X4';
    const deck1 = generateDeck(8, seed);
    const deck2 = generateDeck(8, seed);

    expect(deck1.length).toBe(16);
    expect(deck2.length).toBe(16);

    // Identical order of card IDs
    const ids1 = deck1.map((c) => c.id);
    const ids2 = deck2.map((c) => c.id);
    expect(ids1).toEqual(ids2);

    // Verify all 8 pairs are present twice
    for (let pairId = 0; pairId < 8; pairId++) {
      const occurrences = deck1.filter((c) => c.pairId === pairId);
      expect(occurrences.length).toBe(2);
    }
  });

  it('generates non-empty human-readable random seeds', () => {
    const seed = generateRandomSeed();
    expect(seed).toBeDefined();
    expect(seed.length).toBe(8);
  });

  it('hashes strings deterministically using stringToSeed', () => {
    const hash1 = stringToSeed('HELLO-WORLD');
    const hash2 = stringToSeed('HELLO-WORLD');
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('number');
  });
});
