import { describe, expect, it } from 'vitest';

import {
  createDesignerProfileSchema,
  updateDesignerProfileSchema,
  designerSearchQuerySchema,
} from '@/lib/validations/designer';

describe('createDesignerProfileSchema', () => {
  const validInput = {
    bio: 'Experienced dental designer specializing in crowns.',
    software_skills: ['Exocad', '3Shape'],
    specializations: ['CROWN', 'BRIDGE'],
    years_experience: 5,
  };

  it('should accept valid input with all fields', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      hourly_rate: 50,
      portfolio_urls: ['https://example.com/portfolio'],
      languages: ['en', 'ar'],
      certifications: ['Exocad Certified'],
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid input with only required fields', () => {
    const result = createDesignerProfileSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should require software_skills with at least one item', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      software_skills: [],
    });
    expect(result.success).toBe(false);
  });

  it('should require specializations with at least one item', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      specializations: [],
    });
    expect(result.success).toBe(false);
  });

  it('should validate specializations are valid case types', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      specializations: ['INVALID_TYPE'],
    });
    expect(result.success).toBe(false);
  });

  it('should require years_experience as non-negative integer', () => {
    const negativeResult = createDesignerProfileSchema.safeParse({
      ...validInput,
      years_experience: -1,
    });
    expect(negativeResult.success).toBe(false);

    const floatResult = createDesignerProfileSchema.safeParse({
      ...validInput,
      years_experience: 2.5,
    });
    expect(floatResult.success).toBe(false);
  });

  it('should validate hourly_rate is positive when provided', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      hourly_rate: -10,
    });
    expect(result.success).toBe(false);
  });

  it('should validate portfolio_urls are valid URLs', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      portfolio_urls: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('should trim bio', () => {
    const result = createDesignerProfileSchema.safeParse({
      ...validInput,
      bio: '  trimmed bio  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bio).toBe('trimmed bio');
    }
  });

  it('should default is_available to true', () => {
    const result = createDesignerProfileSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_available).toBe(true);
    }
  });
});

describe('updateDesignerProfileSchema', () => {
  it('should accept partial updates', () => {
    const result = updateDesignerProfileSchema.safeParse({
      bio: 'Updated bio',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateDesignerProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should validate hourly_rate when provided', () => {
    const result = updateDesignerProfileSchema.safeParse({
      hourly_rate: -5,
    });
    expect(result.success).toBe(false);
  });

  it('should allow toggling is_available', () => {
    const result = updateDesignerProfileSchema.safeParse({
      is_available: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_available).toBe(false);
    }
  });

  it('should validate specializations when provided', () => {
    const result = updateDesignerProfileSchema.safeParse({
      specializations: ['INVALID'],
    });
    expect(result.success).toBe(false);
  });

  it('should allow updating languages', () => {
    const result = updateDesignerProfileSchema.safeParse({
      languages: ['en', 'fr', 'de'],
    });
    expect(result.success).toBe(true);
  });
});

describe('designerSearchQuerySchema', () => {
  it('should provide defaults for empty query', () => {
    const result = designerSearchQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
      expect(result.data.sort_by).toBe('avg_rating');
    }
  });

  it('should filter by specialization', () => {
    const result = designerSearchQuerySchema.safeParse({
      specialization: 'CROWN',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid specialization', () => {
    const result = designerSearchQuerySchema.safeParse({
      specialization: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should filter by software', () => {
    const result = designerSearchQuerySchema.safeParse({
      software: 'Exocad',
    });
    expect(result.success).toBe(true);
  });

  it('should filter by min_rating (0-5)', () => {
    const result = designerSearchQuerySchema.safeParse({
      min_rating: 4,
    });
    expect(result.success).toBe(true);

    const tooHigh = designerSearchQuerySchema.safeParse({
      min_rating: 6,
    });
    expect(tooHigh.success).toBe(false);
  });

  it('should filter by is_available', () => {
    const result = designerSearchQuerySchema.safeParse({
      is_available: true,
    });
    expect(result.success).toBe(true);
  });

  it('should filter by language', () => {
    const result = designerSearchQuerySchema.safeParse({
      language: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('should coerce page and per_page from strings', () => {
    const result = designerSearchQuerySchema.safeParse({
      page: '3',
      per_page: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.per_page).toBe(10);
    }
  });

  it('should accept valid sort_by values', () => {
    const ratingSort = designerSearchQuerySchema.safeParse({ sort_by: 'avg_rating' });
    expect(ratingSort.success).toBe(true);

    const expSort = designerSearchQuerySchema.safeParse({ sort_by: 'years_experience' });
    expect(expSort.success).toBe(true);

    const casesSort = designerSearchQuerySchema.safeParse({ sort_by: 'completed_cases' });
    expect(casesSort.success).toBe(true);

    const rateSort = designerSearchQuerySchema.safeParse({ sort_by: 'hourly_rate' });
    expect(rateSort.success).toBe(true);
  });

  it('should allow search query string', () => {
    const result = designerSearchQuerySchema.safeParse({
      q: 'crown specialist',
    });
    expect(result.success).toBe(true);
  });
});
