import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DesignerService } from '@/services/designer.service';

function createMockClient(overrides: Record<string, unknown> = {}) {
  const client = {
    from: vi.fn(),
    ...overrides,
  };
  return client as never;
}

describe('DesignerService', () => {
  let service: DesignerService;

  beforeEach(() => {
    service = new DesignerService();
  });

  describe('getProfile', () => {
    it('should fetch a designer profile by ID', async () => {
      const mockProfile = { id: 'dp-1', user_id: 'u-1', bio: 'Expert', avg_rating: 4.5 };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getProfile(client, 'dp-1');
      expect(result).toEqual(mockProfile);
      expect(client.from).toHaveBeenCalledWith('designer_profiles');
      expect(eq).toHaveBeenCalledWith('id', 'dp-1');
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found', code: 'PGRST116' } });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      await expect(service.getProfile(client, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('getProfileByUserId', () => {
    it('should fetch a designer profile by user ID', async () => {
      const mockProfile = { id: 'dp-1', user_id: 'u-1', bio: 'Expert' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getProfileByUserId(client, 'u-1');
      expect(result).toEqual(mockProfile);
      expect(eq).toHaveBeenCalledWith('user_id', 'u-1');
    });
  });

  describe('createProfile', () => {
    it('should create a designer profile', async () => {
      const input = {
        bio: 'Expert designer',
        software_skills: ['Exocad'],
        specializations: ['CROWN'],
        years_experience: 5,
      };
      const mockProfile = { id: 'dp-1', user_id: 'u-1', ...input };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      client.from.mockReturnValue({ insert });

      const result = await service.createProfile(client, 'u-1', input);
      expect(result).toEqual(mockProfile);
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 'u-1',
        bio: 'Expert designer',
      }));
    });
  });

  describe('updateProfile', () => {
    it('should update a designer profile', async () => {
      const updates = { bio: 'Updated bio', hourly_rate: 60 };
      const mockProfile = { id: 'dp-1', user_id: 'u-1', ...updates };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.updateProfile(client, 'u-1', updates);
      expect(result).toEqual(mockProfile);
      expect(update).toHaveBeenCalledWith(expect.objectContaining({
        bio: 'Updated bio',
        hourly_rate: 60,
      }));
      expect(eq).toHaveBeenCalledWith('user_id', 'u-1');
    });
  });

  describe('listDesigners', () => {
    it('should return paginated results', async () => {
      const mockData = [
        { id: 'dp-1', avg_rating: 4.5 },
        { id: 'dp-2', avg_rating: 4.0 },
      ];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 2 });
      const order = vi.fn().mockReturnValue({ range });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.listDesigners(client, { page: 1, per_page: 20, sort_by: 'avg_rating' });
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by specialization', async () => {
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const order = vi.fn().mockReturnValue({ range });
      const contains = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ contains });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      await service.listDesigners(client, {
        page: 1,
        per_page: 20,
        sort_by: 'avg_rating',
        specialization: 'CROWN',
      });
      expect(contains).toHaveBeenCalledWith('specializations', ['CROWN']);
    });

    it('should filter by software', async () => {
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const order = vi.fn().mockReturnValue({ range });
      const contains = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ contains });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      await service.listDesigners(client, {
        page: 1,
        per_page: 20,
        sort_by: 'avg_rating',
        software: 'Exocad',
      });
      expect(contains).toHaveBeenCalledWith('software_skills', ['Exocad']);
    });

    it('should filter by min_rating', async () => {
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const order = vi.fn().mockReturnValue({ range });
      const gte = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ gte });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      await service.listDesigners(client, {
        page: 1,
        per_page: 20,
        sort_by: 'avg_rating',
        min_rating: 4,
      });
      expect(gte).toHaveBeenCalledWith('avg_rating', 4);
    });
  });
});
