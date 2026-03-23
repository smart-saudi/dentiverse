import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DesignVersionService } from '@/services/design-version.service';

function createMockClient() {
  return { from: vi.fn() } as never;
}

describe('DesignVersionService', () => {
  let service: DesignVersionService;

  beforeEach(() => {
    service = new DesignVersionService();
  });

  describe('createVersion', () => {
    it('should create a design version with SUBMITTED status', async () => {
      const input = { file_urls: ['https://example.com/file.stl'], notes: 'First version' };
      const mockVersion = { id: 'dv-1', case_id: 'c-1', designer_id: 'u-1', version_number: 1, status: 'SUBMITTED', ...input };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      client.from.mockReturnValue({ insert });

      const result = await service.createVersion(client, 'c-1', 'u-1', 1, input);
      expect(result.status).toBe('SUBMITTED');
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        case_id: 'c-1',
        version_number: 1,
        status: 'SUBMITTED',
      }));
    });
  });

  describe('getVersion', () => {
    it('should fetch a design version by ID', async () => {
      const mockVersion = { id: 'dv-1', version_number: 1, status: 'SUBMITTED' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getVersion(client, 'dv-1');
      expect(result).toEqual(mockVersion);
    });
  });

  describe('listVersionsForCase', () => {
    it('should return versions ordered by version_number desc', async () => {
      const mockData = [
        { id: 'dv-2', version_number: 2 },
        { id: 'dv-1', version_number: 1 },
      ];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 2 });
      const order = vi.fn().mockReturnValue({ range });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.listVersionsForCase(client, 'c-1', { page: 1, per_page: 20 });
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('reviewVersion', () => {
    it('should approve a design version', async () => {
      const mockVersion = { id: 'dv-1', status: 'APPROVED' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.reviewVersion(client, 'dv-1', { status: 'APPROVED' });
      expect(result.status).toBe('APPROVED');
    });

    it('should request revision with feedback', async () => {
      const mockVersion = { id: 'dv-1', status: 'REVISION_REQUESTED', revision_feedback: 'Fix contacts' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.reviewVersion(client, 'dv-1', {
        status: 'REVISION_REQUESTED',
        revision_feedback: 'Fix contacts',
      });
      expect(result.status).toBe('REVISION_REQUESTED');
    });
  });

  describe('getLatestVersion', () => {
    it('should return the latest version for a case', async () => {
      const mockVersion = { id: 'dv-3', version_number: 3 };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockVersion, error: null });
      const limit = vi.fn().mockReturnValue({ single });
      const order = vi.fn().mockReturnValue({ limit });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getLatestVersion(client, 'c-1');
      expect(result?.version_number).toBe(3);
    });
  });
});
