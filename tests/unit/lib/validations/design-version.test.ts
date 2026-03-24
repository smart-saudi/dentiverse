import { describe, expect, it } from 'vitest';

import {
  createDesignVersionSchema,
  reviewDesignVersionSchema,
  designVersionListQuerySchema,
  DESIGN_VERSION_STATUSES,
} from '@/lib/validations/design-version';

describe('createDesignVersionSchema', () => {
  const validInput = {
    files: [
      {
        bucket: 'design-files',
        path: 'designer-1/file1.stl',
        name: 'file1.stl',
        size: 2048,
        type: 'model/stl',
      },
    ],
    notes: 'Initial submission with full arch.',
  };

  it('should accept valid input', () => {
    const result = createDesignVersionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should require at least one stored file reference', () => {
    const result = createDesignVersionSchema.safeParse({ ...validInput, files: [] });
    expect(result.success).toBe(false);
  });

  it('should reject malformed file references', () => {
    const result = createDesignVersionSchema.safeParse({
      ...validInput,
      files: [{ bucket: '', path: '', name: '', size: -1, type: '' }],
    });
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
      files: [
        {
          bucket: 'design-files',
          path: 'designer-1/file.stl',
          name: 'file.stl',
          size: 1024,
          type: 'model/stl',
        },
      ],
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
