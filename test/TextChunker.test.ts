import { describe, it, expect } from 'vitest';
import { splitTextIntoChunks, calculateTypingDelay } from '../src/engine/TextChunker';

describe('splitTextIntoChunks', () => {
  it('returns a single chunk when text is within the max length', () => {
    const text = 'Short sentence.';
    expect(splitTextIntoChunks(text, 180)).toEqual([text]);
  });

  it('splits on sentence boundaries without exceeding the max length', () => {
    const text = 'Sentence one is here. Sentence two is here. Sentence three is here.';
    const chunks = splitTextIntoChunks(text, 40);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(40);
    }
    // No content should be lost (ignoring whitespace trimming between chunks).
    expect(chunks.join(' ').replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
  });

  it('falls back to fixed-width slicing when there are no sentence boundaries', () => {
    const text = 'a'.repeat(100);
    const chunks = splitTextIntoChunks(text, 30);
    expect(chunks).toEqual(['a'.repeat(30), 'a'.repeat(30), 'a'.repeat(30), 'a'.repeat(10)]);
  });
});

describe('calculateTypingDelay', () => {
  it('clamps short text to the minimum delay', () => {
    expect(calculateTypingDelay(1, 35, 1000, 5000)).toBe(1000);
  });

  it('clamps long text to the maximum delay', () => {
    expect(calculateTypingDelay(1000, 35, 1000, 5000)).toBe(5000);
  });

  it('scales linearly between the bounds', () => {
    expect(calculateTypingDelay(100, 35, 1000, 5000)).toBe(3500);
  });
});
