import { describe, it, expect } from 'vitest';

import { createMessageSchema, messageListQuerySchema } from '@/lib/validations/message';

describe('createMessageSchema', () => {
  it('should accept valid message', () => {
    const result = createMessageSchema.safeParse({ content: 'Hello!' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Hello!');
      expect(result.data.attachment_urls).toEqual([]);
    }
  });

  it('should accept message with attachments', () => {
    const result = createMessageSchema.safeParse({
      content: 'See attached',
      attachment_urls: ['https://example.com/file.stl'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty content', () => {
    const result = createMessageSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('should reject whitespace-only content', () => {
    const result = createMessageSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
  });

  it('should reject content over 5000 chars', () => {
    const result = createMessageSchema.safeParse({ content: 'a'.repeat(5001) });
    expect(result.success).toBe(false);
  });

  it('should reject invalid attachment URLs', () => {
    const result = createMessageSchema.safeParse({
      content: 'Hello',
      attachment_urls: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 attachments', () => {
    const urls = Array.from({ length: 11 }, (_, i) => `https://example.com/file${i}.stl`);
    const result = createMessageSchema.safeParse({ content: 'Hello', attachment_urls: urls });
    expect(result.success).toBe(false);
  });
});

describe('messageListQuerySchema', () => {
  it('should apply defaults', () => {
    const result = messageListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(50);
    }
  });

  it('should coerce string page to number', () => {
    const result = messageListQuerySchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });

  it('should reject page < 1', () => {
    const result = messageListQuerySchema.safeParse({ page: '0' });
    expect(result.success).toBe(false);
  });
});
