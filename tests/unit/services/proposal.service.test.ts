import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ProposalService } from '@/services/proposal.service';

function createMockClient(overrides: Record<string, unknown> = {}) {
  return { from: vi.fn(), ...overrides } as never;
}

describe('ProposalService', () => {
  let service: ProposalService;

  beforeEach(() => {
    service = new ProposalService();
  });

  describe('createProposal', () => {
    it('should create a proposal with PENDING status', async () => {
      const input = { price: 150, estimated_hours: 8, message: 'I can do this.' };
      const mockProposal = { id: 'p-1', case_id: 'c-1', designer_id: 'u-1', status: 'PENDING', ...input };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProposal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      client.from.mockReturnValue({ insert });

      const result = await service.createProposal(client, 'c-1', 'u-1', input);
      expect(result.status).toBe('PENDING');
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({
        case_id: 'c-1',
        designer_id: 'u-1',
        price: 150,
      }));
    });
  });

  describe('getProposal', () => {
    it('should fetch a proposal by ID', async () => {
      const mockProposal = { id: 'p-1', status: 'PENDING' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProposal, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getProposal(client, 'p-1');
      expect(result).toEqual(mockProposal);
    });
  });

  describe('listProposalsForCase', () => {
    it('should return paginated proposals for a case', async () => {
      const mockData = [{ id: 'p-1' }, { id: 'p-2' }];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 2 });
      const order = vi.fn().mockReturnValue({ range });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.listProposalsForCase(client, 'c-1', { page: 1, per_page: 20 });
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
      expect(eq).toHaveBeenCalledWith('case_id', 'c-1');
    });
  });

  describe('listProposalsByDesigner', () => {
    it('should return paginated proposals by designer', async () => {
      const mockData = [{ id: 'p-1' }];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 1 });
      const order = vi.fn().mockReturnValue({ range });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.listProposalsByDesigner(client, 'u-1', { page: 1, per_page: 20 });
      expect(result.data).toEqual(mockData);
      expect(eq).toHaveBeenCalledWith('designer_id', 'u-1');
    });
  });

  describe('acceptProposal', () => {
    it('should update proposal status to ACCEPTED', async () => {
      const mockProposal = { id: 'p-1', status: 'ACCEPTED', case_id: 'c-1' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProposal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.acceptProposal(client, 'p-1');
      expect(result.status).toBe('ACCEPTED');
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'ACCEPTED' }));
    });
  });

  describe('rejectProposal', () => {
    it('should update proposal status to REJECTED', async () => {
      const mockProposal = { id: 'p-1', status: 'REJECTED' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProposal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.rejectProposal(client, 'p-1');
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('withdrawProposal', () => {
    it('should update proposal status to WITHDRAWN', async () => {
      const mockProposal = { id: 'p-1', status: 'WITHDRAWN' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockProposal, error: null });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.withdrawProposal(client, 'p-1');
      expect(result.status).toBe('WITHDRAWN');
    });
  });
});
