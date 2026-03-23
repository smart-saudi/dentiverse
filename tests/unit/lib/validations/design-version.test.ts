import { describe, expect, it } from 'vitest';

import {
  createDesignVersionSchema,
  reviewDesignVersionSchema,
  designVersionListQuerySchema,
  DESIGN_VERSION_STATUSES,
} from '@/lib/validations/design-version';

describe('createDesignVersionSchema', () => {
  const validInput = {
    file_urls: ['https://storage.example.com/file1.stl'],
    notes: 'Initial submission with full arch.',
  };

  it('should accept valid input', () => {
    const result = createDesignVersionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should require at least one file URL', () => {
    const result = createDesignVersionSchema.safeParse({ ...validInput, file_urls: [] });
    expect(result.success).toBe(false);
  });

  it('should validate file URLs are valid URLs', () => {
    const result = createDesignVersionSchema.safeParse({ ...validInput, file_urls: ['not-a-url'] });
    expect(result.success).toBe(false);
  });

  it('should accept optional preview_model_url', () => {
    const result = createDesignVersionSchema.safeParse({
      ...validInput,
      preview_model_url: 'https://storage.example.com/preview.glb',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional thumbnail_url', () => {
    const result = createDesignVersionSchema.safeParse({
      ...validInput,
      thumbnail_url: 'https://storage.example.com/thumb.png',
    });
    expect(result.success).toBe(true);
  });

  it('should make notes optional', () => {
    const result = createDesignVersionSchema.safeParse({
      file_urls: ['https://storage.example.com/file.stl'],
    });
    expect(result.success).toBe(true);
  });

  it('should trim notes', () => {
    const result = createDesignVersionSchema.safeParse({
      ...validInput,
      notes: '  trimmed notes  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe('trimmed notes');
    }
  });
});

describe('reviewDesignVersionSchema', () => {
  it('should accept APPROVED status', () => {
    const result = reviewDesignVersionSchema.safeParse({ status: 'APPROVED' });
    expect(result.success).toBe(true);
  });

  it('should accept REVISION_REQUESTED with feedback', () => {
    const result = reviewDesignVersionSchema.safeParse({
      status: 'REVISION_REQUESTED',
      revision_feedback: 'Please adjust the mesial contact.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject SUBMITTED as a review status', () => {
    const result = reviewDesignVersionSchema.safeParse({ status: 'SUBMITTED' });
    expect(result.success).toBe(false);
  });

  it('should trim revision_feedback', () => {
    const result = reviewDesignVersionSchema.safeParse({
      status: 'REVISION_REQUESTED',
      revision_feedback: '  feedback  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.revision_feedback).toBe('feedback');
    }
  });
});

describe('designVersionListQuerySchema', () => {
  it('should provide defaults for empty query', () => {
    const result = designVersionListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
    }
  });

  it('should coerce page from string', () => {
    const result = designVersionListQuerySchema.safeParse({ page: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe('DESIGN_VERSION_STATUSES', () => {
  it('should include all expected statuses', () => {
    expect(DESIGN_VERSION_STATUSES).toContain('SUBMITTED');
    expect(DESIGN_VERSION_STATUSES).toContain('APPROVED');
    expect(DESIGN_VERSION_STATUSES).toContain('REVISION_REQUESTED');
  });
});
