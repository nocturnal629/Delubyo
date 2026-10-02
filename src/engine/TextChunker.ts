/**
 * Pure helpers for breaking long narrative text into chat-sized chunks and for
 * computing how long the "typing..." indicator should show before each chunk.
 *
 * These were extracted from StoryEngine so the (easily-unit-tested) math lives
 * away from the stateful game-orchestration code. Behavior is intentionally
 * identical to the original inline implementation.
 */

/** Default maximum length of a single displayed message chunk. */
export const DEFAULT_MAX_MESSAGE_LENGTH = 180;
/** Default per-character typing speed, in milliseconds. */
export const DEFAULT_TYPING_SPEED = 35;
/** Default floor/ceiling for how long the typing indicator shows. */
export const DEFAULT_MIN_TYPING_TIME = 1000;
export const DEFAULT_MAX_TYPING_TIME = 5000;

/**
 * Splits text into chunks no longer than `maxLength`, preferring to break on
 * sentence boundaries. If the text has no detectable sentences it falls back to
 * fixed-width slicing.
 */
export function splitTextIntoChunks(
  text: string,
  maxLength: number = DEFAULT_MAX_MESSAGE_LENGTH
): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, Math.min(i + maxLength, text.length)));
    }
    return chunks;
  }

  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Computes how long the typing indicator should display for a chunk of the
 * given length, clamped between `minMs` and `maxMs`.
 */
export function calculateTypingDelay(
  textLength: number,
  typingSpeed: number = DEFAULT_TYPING_SPEED,
  minMs: number = DEFAULT_MIN_TYPING_TIME,
  maxMs: number = DEFAULT_MAX_TYPING_TIME
): number {
  return Math.min(Math.max(textLength * typingSpeed, minMs), maxMs);
}
