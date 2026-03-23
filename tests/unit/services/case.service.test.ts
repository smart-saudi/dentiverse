import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CaseService } from '@/services/case.service';

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function mockSupabase(overrides: Record<string, unknown> = {}) {
  const singleFn = vi.fn();
  const eqFn = vi.fn().mockReturnValue({ single: singleFn });
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn, single: singleFn });
  const insertFn = vi.fn().mockReturnValue({ select: selectFn });
  const updateFn = vi.fn().mockReturnValue({ eq: eqFn, select: selectFn });

  // For list queries
  const rangeFn = vi.fn();
  const orderFn = vi.fn().mockReturnValue({ range: rangeFn });
  const listEqFn = vi.fn().mockReturnValue({ order: orderFn, range: rangeFn });
  const listSelectFn = vi.fn().mockReturnValue({
    eq: listEqFn,
    order: orderFn,
    range: rangeFn,
  });

  const fromFn = vi.fn().mockReturnValue({
    insert: insertFn,
    update: updateFn,
    select: listSelectFn,
    ...overrides,
  });

  return {
    client: { from: fromFn, auth: { getUser: vi.fn() } } as any,
    fromFn,
    insertFn,
    updateFn,
    selectFn,
    singleFn,
    eqFn,
    rangeFn,
    orderFn,
    listSelectFn,
    listEqFn,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CaseService', () => {
  let service: CaseService;

  beforeEach(() => {
    service = new CaseService();
  });

  describe('createCase', () => {
    it('should insert a case row with client_id and status DRAFT', async () => {
      const mocks = mockSupabase();
      mocks.singleFn.mockResolvedValue({
        data: {
          id: 'case-1',
          client_id: 'user-1',
          status: 'DRAFT',
          title: 'Crown #14',
          case_type: 'CROWN',
          tooth_numbers: [14],
        },
        error: null,
      });

      const result = await service.createCase(mocks.client, 'user-1', {
        case_type: 'CROWN',
        title: 'Crown #14',
        tooth_numbers: [14],
        urgency: 'normal',
        output_format: 'STL',
        max_revisions: 2,
      });

      expect(mocks.fromFn).toHaveBeenCalledWith('cases');
      expect(mocks.insertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'user-1',
          status: 'DRAFT',
          case_type: 'CROWN',
          title: 'Crown #14',
          tooth_numbers: [14],
        }),
      );
      expect(result.id).toBe('case-1');
      expect(result.status).toBe('DRAFT');
    });

    it('should throw when insert fails', async () => {
      const mocks = mockSupabase();
      mocks.singleFn.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(
        service.createCase(mocks.client, 'user-1', {
          case_type: 'CROWN',
          title: 'Test',
          tooth_numbers: [14],
          urgency: 'normal',
          output_format: 'STL',
          max_revisions: 2,
        }),
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('getCase', () => {
    it('should return a case by ID', async () => {
      const singleFn = vi.fn().mockResolvedValue({
        data: { id: 'case-1', title: 'Crown #14', status: 'OPEN' },
        error: null,
      });
      const fromFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single: singleFn }),
        }),
      });
      const client = { from: fromFn, auth: { getUser: vi.fn() } } as any;

      const result = await service.getCase(client, 'case-1');

      expect(fromFn).toHaveBeenCalledWith('cases');
      expect(result.id).toBe('case-1');
    });

    it('should throw when case not found', async () => {
      const singleFn = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Row not found', code: 'PGRST116' },
      });
      const fromFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single: singleFn }),
        }),
      });
      const client = { from: fromFn, auth: { getUser: vi.fn() } } as any;

      await expect(service.getCase(client, 'nonexistent')).rejects.toThrow();
    });
  });

  describe('updateCase', () => {
    it('should update case fields', async () => {
      const mocks = mockSupabase();
      // updateFn returns { eq: ... }
      const updateEqFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'case-1', title: 'Updated Title' },
            error: null,
          }),
        }),
      });
      mocks.client.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: updateEqFn }),
      });

      const result = await service.updateCase(mocks.client, 'case-1', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw when update fails', async () => {
      const mocks = mockSupabase();
      const updateEqFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' },
          }),
        }),
      });
      mocks.client.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: updateEqFn }),
      });

      await expect(
        service.updateCase(mocks.client, 'case-1', { title: 'New' }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('publishCase', () => {
    it('should change status from DRAFT to OPEN', async () => {
      const mocks = mockSupabase();
      const updateEqFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'case-1', status: 'OPEN' },
            error: null,
          }),
        }),
      });
      mocks.client.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: updateEqFn }),
      });

      const result = await service.publishCase(mocks.client, 'case-1');

      expect(result.status).toBe('OPEN');
    });
  });

  describe('cancelCase', () => {
    it('should set status to CANCELLED with a reason', async () => {
      const mocks = mockSupabase();
      const updateEqFn = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'case-1',
              status: 'CANCELLED',
              cancellation_reason: 'No longer needed',
            },
            error: null,
          }),
        }),
      });
      mocks.client.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({ eq: updateEqFn }),
      });

      const result = await service.cancelCase(mocks.client, 'case-1', 'No longer needed');

      expect(result.status).toBe('CANCELLED');
      expect(result.cancellation_reason).toBe('No longer needed');
    });
  });

  describe('listCases', () => {
    it('should return paginated results with meta', async () => {
      const mocks = mockSupabase();
      mocks.rangeFn.mockResolvedValue({
        data: [
          { id: 'case-1', title: 'Case 1' },
          { id: 'case-2', title: 'Case 2' },
        ],
        error: null,
        count: 5,
      });

      const result = await service.listCases(mocks.client, {
        page: 1,
        per_page: 2,
        sort_by: 'created_at',
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.page).toBe(1);
      expect(result.meta.per_page).toBe(2);
      expect(result.meta.total_pages).toBe(3);
    });

    it('should apply status filter when provided', async () => {
      const mocks = mockSupabase();
      mocks.rangeFn.mockResolvedValue({
        data: [{ id: 'case-1', status: 'OPEN' }],
        error: null,
        count: 1,
      });

      await service.listCases(mocks.client, {
        page: 1,
        per_page: 20,
        sort_by: 'created_at',
        status: 'OPEN',
      });

      expect(mocks.listEqFn).toHaveBeenCalledWith('status', 'OPEN');
    });

    it('should throw when query fails', async () => {
      const mocks = mockSupabase();
      mocks.rangeFn.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
        count: null,
      });

      await expect(
        service.listCases(mocks.client, {
          page: 1,
          per_page: 20,
          sort_by: 'created_at',
        }),
      ).rejects.toThrow('Query failed');
    });
  });
});
