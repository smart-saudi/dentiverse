import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateAdminClient = vi.fn();
const mockCaptureServerException = vi.fn();
const mockLogServerEvent = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}));

vi.mock('@/lib/observability/server', () => ({
  captureServerException: mockCaptureServerException,
  logServerEvent: mockLogServerEvent,
}));

function createLookupClient(rows: {
  cases?: Record<string, unknown>;
  users?: Record<string, unknown>;
  payments?: Record<string, unknown>;
}) {
  return {
    from: vi.fn((table: 'cases' | 'users' | 'payments') => ({
      select: vi.fn(() => ({
        eq: vi.fn((_column: string, id: string) => ({
          single: vi
            .fn()
            .mockResolvedValue(
              rows[table]?.[id]
                ? { data: rows[table]?.[id] ?? null, error: null }
                : { data: null, error: { message: `${table} row not found` } },
            ),
        })),
      })),
    })),
  };
}

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_NAME = 'DentiVerse';
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.EMAIL_FROM_ADDRESS = 'DentiVerse <notifications@example.com>';
    delete process.env.EMAIL_REPLY_TO;
  });

  it('should send a proposal received email to the case client', async () => {
    const resend = {
      emails: {
        send: vi.fn().mockResolvedValue({ data: { id: 'email_123' }, error: null }),
      },
    };

    mockCreateAdminClient.mockReturnValue(
      createLookupClient({
        cases: {
          'case-1': {
            id: 'case-1',
            title: 'Upper Crown #14',
            currency: 'USD',
            client_id: 'client-1',
          },
        },
        users: {
          'client-1': {
            id: 'client-1',
            email: 'client@example.com',
            full_name: 'Dr. Client',
          },
          'designer-1': {
            id: 'designer-1',
            email: 'designer@example.com',
            full_name: 'Dana Designer',
          },
        },
      }),
    );

    const { EmailService } = await import('@/services/email.service');
    const service = new EmailService(resend);

    const result = await service.sendProposalReceivedEmail({
      caseId: 'case-1',
      proposalId: 'proposal-1',
      designerId: 'designer-1',
      estimatedHours: 8,
      price: 150,
    });

    expect(result.status).toBe('sent');
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'DentiVerse <notifications@example.com>',
        to: 'client@example.com',
        subject: 'New proposal for Upper Crown #14',
      }),
    );
    expect(mockLogServerEvent).toHaveBeenCalledWith(
      'info',
      'Transactional email sent',
      expect.objectContaining({
        context: expect.objectContaining({
          event: 'proposal.received',
          related_entity_id: 'proposal-1',
        }),
      }),
    );
  });

  it('should skip email delivery when Resend is not configured', async () => {
    process.env.RESEND_API_KEY = '';

    const resend = {
      emails: {
        send: vi.fn(),
      },
    };

    const { EmailService } = await import('@/services/email.service');
    const service = new EmailService(resend);

    const result = await service.sendProposalReceivedEmail({
      caseId: 'case-1',
      proposalId: 'proposal-1',
      designerId: 'designer-1',
      estimatedHours: 8,
      price: 150,
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'missing_resend_api_key',
    });
    expect(resend.emails.send).not.toHaveBeenCalled();
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
    expect(mockLogServerEvent).toHaveBeenCalledWith(
      'info',
      'Transactional email skipped because email delivery is disabled',
      expect.objectContaining({
        context: expect.objectContaining({
          event: 'proposal.received',
          reason: 'missing_resend_api_key',
        }),
      }),
    );
  });

  it('should construct without a Resend API key until delivery is attempted', async () => {
    process.env.RESEND_API_KEY = '';

    const { EmailService } = await import('@/services/email.service');

    expect(() => new EmailService()).not.toThrow();
  });

  it('should capture and swallow email delivery failures', async () => {
    const resend = {
      emails: {
        send: vi.fn().mockRejectedValue(new Error('Resend unavailable')),
      },
    };

    mockCreateAdminClient.mockReturnValue(
      createLookupClient({
        cases: {
          'case-9': {
            id: 'case-9',
            title: 'Lower Bridge #18-20',
            currency: 'USD',
            client_id: 'client-9',
          },
        },
        users: {
          'client-9': {
            id: 'client-9',
            email: 'client9@example.com',
            full_name: 'Dr. Client Nine',
          },
          'designer-9': {
            id: 'designer-9',
            email: 'designer9@example.com',
            full_name: 'Nina Designer',
          },
        },
        payments: {
          'payment-9': {
            id: 'payment-9',
            case_id: 'case-9',
            client_id: 'client-9',
            designer_id: 'designer-9',
            amount: 220,
            designer_payout: 193.6,
            currency: 'USD',
          },
        },
      }),
    );

    const { EmailService } = await import('@/services/email.service');
    const service = new EmailService(resend);

    const result = await service.sendPaymentReleasedEmail({ paymentId: 'payment-9' });

    expect(result.status).toBe('failed');
    expect(result.reason).toBe('Resend unavailable');
    expect(mockCaptureServerException).toHaveBeenCalledWith(
      expect.any(Error),
      'Transactional email delivery failed',
      expect.objectContaining({
        context: expect.objectContaining({
          event: 'payment.released',
          related_entity_id: 'payment-9',
          provider: 'resend',
        }),
      }),
    );
  });
});
