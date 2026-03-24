import { Resend } from 'resend';

import { captureServerException, logServerEvent } from '@/lib/observability/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface EmailSendResponse {
  data?: { id?: string | null } | null;
  error?: { message?: string | null } | null;
}

interface ResendClientLike {
  emails: {
    send(input: {
      from: string;
      to: string | string[];
      subject: string;
      html: string;
      text: string;
      replyTo?: string | string[];
    }): Promise<EmailSendResponse>;
  };
}

interface TransactionalEmailPayload {
  event:
    | 'proposal.received'
    | 'design.submitted'
    | 'payment.confirmed'
    | 'payment.released';
  recipientEmail: string;
  recipientUserId: string;
  subject: string;
  html: string;
  text: string;
  relatedEntityId: string;
  relatedEntityType: 'proposal' | 'design_version' | 'payment';
}

interface EmailConfig {
  apiKey: string | null;
  fromAddress: string | null;
  replyTo: string | null;
}

interface UserEmailProfile {
  id: string;
  email: string;
  full_name: string;
}

interface CaseEmailSummary {
  id: string;
  title: string;
  currency: string;
  client_id: string;
}

interface PaymentEmailSummary {
  id: string;
  case_id: string;
  client_id: string;
  designer_id: string;
  amount: number;
  designer_payout: number;
  currency: string;
}

export interface EmailDispatchResult {
  status: 'sent' | 'skipped' | 'failed';
  messageId?: string | null;
  reason?: string;
}

export interface ProposalReceivedEmailInput {
  caseId: string;
  proposalId: string;
  designerId: string;
  estimatedHours: number;
  price: number;
}

export interface DesignSubmittedEmailInput {
  caseId: string;
  designVersionId: string;
  designerId: string;
  versionNumber: number;
}

export interface PaymentEmailInput {
  paymentId: string;
}

/**
 * Service for non-blocking transactional email delivery through Resend.
 *
 * Cross-user marketplace events need privileged, read-only access to the
 * recipient profile and case metadata, so this service uses the admin client
 * on the server to assemble the email context before sending.
 */
export class EmailService {
  private readonly resend: ResendClientLike;

  constructor(resendClient?: ResendClientLike) {
    this.resend = resendClient ?? new Resend(process.env.RESEND_API_KEY ?? '');
  }

  /**
   * Send a client-facing email when a designer submits a new proposal.
   *
   * @param input - Proposal event data
   * @returns Delivery result without throwing on failure
   */
  async sendProposalReceivedEmail(
    input: ProposalReceivedEmailInput,
  ): Promise<EmailDispatchResult> {
    const disabledResult = this.getDisabledResult(
      'proposal.received',
      input.proposalId,
      'proposal',
    );
    if (disabledResult) {
      return disabledResult;
    }

    try {
      const admin = createAdminClient();
      const caseRow = await this.getCaseSummary(admin, input.caseId);
      const [client, designer] = await Promise.all([
        this.getUserProfile(admin, caseRow.client_id),
        this.getUserProfile(admin, input.designerId),
      ]);

      const caseUrl = this.buildCaseUrl(caseRow.id);
      const formattedPrice = this.formatCurrency(input.price, caseRow.currency);

      return await this.sendTransactionalEmail({
        event: 'proposal.received',
        recipientEmail: client.email,
        recipientUserId: client.id,
        subject: `New proposal for ${caseRow.title}`,
        html: this.buildHtmlEmail({
          greetingName: client.full_name,
          intro: `${designer.full_name} submitted a new proposal for "${caseRow.title}".`,
          details: [
            ['Quoted price', formattedPrice],
            ['Estimated turnaround', `${input.estimatedHours} hours`],
          ],
          ctaLabel: 'Review Proposal',
          ctaUrl: caseUrl,
          outro:
            'Open the case in DentiVerse to review the designer and decide next steps.',
        }),
        text: [
          `Hi ${client.full_name},`,
          '',
          `${designer.full_name} submitted a new proposal for "${caseRow.title}".`,
          `Quoted price: ${formattedPrice}`,
          `Estimated turnaround: ${input.estimatedHours} hours`,
          '',
          `Review proposal: ${caseUrl}`,
        ].join('\n'),
        relatedEntityId: input.proposalId,
        relatedEntityType: 'proposal',
      });
    } catch (error) {
      return this.captureEmailFailure(
        error,
        'Failed to prepare proposal received email',
        'proposal.received',
        input.proposalId,
        'proposal',
      );
    }
  }

  /**
   * Send a client-facing email when a designer submits a design version.
   *
   * @param input - Design submission event data
   * @returns Delivery result without throwing on failure
   */
  async sendDesignSubmittedEmail(
    input: DesignSubmittedEmailInput,
  ): Promise<EmailDispatchResult> {
    const disabledResult = this.getDisabledResult(
      'design.submitted',
      input.designVersionId,
      'design_version',
    );
    if (disabledResult) {
      return disabledResult;
    }

    try {
      const admin = createAdminClient();
      const caseRow = await this.getCaseSummary(admin, input.caseId);
      const [client, designer] = await Promise.all([
        this.getUserProfile(admin, caseRow.client_id),
        this.getUserProfile(admin, input.designerId),
      ]);

      const caseUrl = this.buildCaseUrl(caseRow.id);

      return await this.sendTransactionalEmail({
        event: 'design.submitted',
        recipientEmail: client.email,
        recipientUserId: client.id,
        subject: `Design submitted for ${caseRow.title}`,
        html: this.buildHtmlEmail({
          greetingName: client.full_name,
          intro: `${designer.full_name} uploaded design version ${input.versionNumber} for "${caseRow.title}".`,
          details: [['Version', `${input.versionNumber}`]],
          ctaLabel: 'Review Design',
          ctaUrl: caseUrl,
          outro:
            'Open the case in DentiVerse to review the files, inspect the 3D preview, and approve or request revisions.',
        }),
        text: [
          `Hi ${client.full_name},`,
          '',
          `${designer.full_name} uploaded design version ${input.versionNumber} for "${caseRow.title}".`,
          '',
          `Review design: ${caseUrl}`,
        ].join('\n'),
        relatedEntityId: input.designVersionId,
        relatedEntityType: 'design_version',
      });
    } catch (error) {
      return this.captureEmailFailure(
        error,
        'Failed to prepare design submitted email',
        'design.submitted',
        input.designVersionId,
        'design_version',
      );
    }
  }

  /**
   * Send a designer-facing email after Stripe confirms client funding.
   *
   * @param input - Payment event data
   * @returns Delivery result without throwing on failure
   */
  async sendPaymentConfirmedEmail(
    input: PaymentEmailInput,
  ): Promise<EmailDispatchResult> {
    const disabledResult = this.getDisabledResult(
      'payment.confirmed',
      input.paymentId,
      'payment',
    );
    if (disabledResult) {
      return disabledResult;
    }

    try {
      const admin = createAdminClient();
      const payment = await this.getPaymentSummary(admin, input.paymentId);
      const [caseRow, designer, client] = await Promise.all([
        this.getCaseSummary(admin, payment.case_id),
        this.getUserProfile(admin, payment.designer_id),
        this.getUserProfile(admin, payment.client_id),
      ]);

      const caseUrl = this.buildCaseUrl(caseRow.id);
      const formattedAmount = this.formatCurrency(payment.amount, payment.currency);

      return await this.sendTransactionalEmail({
        event: 'payment.confirmed',
        recipientEmail: designer.email,
        recipientUserId: designer.id,
        subject: `Payment confirmed for ${caseRow.title}`,
        html: this.buildHtmlEmail({
          greetingName: designer.full_name,
          intro: `${client.full_name} has confirmed payment for "${caseRow.title}".`,
          details: [['Escrow amount', formattedAmount]],
          ctaLabel: 'Open Assigned Case',
          ctaUrl: caseUrl,
          outro:
            'The case is ready in your dashboard and funding is secured for the work in progress.',
        }),
        text: [
          `Hi ${designer.full_name},`,
          '',
          `${client.full_name} has confirmed payment for "${caseRow.title}".`,
          `Escrow amount: ${formattedAmount}`,
          '',
          `Open assigned case: ${caseUrl}`,
        ].join('\n'),
        relatedEntityId: payment.id,
        relatedEntityType: 'payment',
      });
    } catch (error) {
      return this.captureEmailFailure(
        error,
        'Failed to prepare payment confirmed email',
        'payment.confirmed',
        input.paymentId,
        'payment',
      );
    }
  }

  /**
   * Send a designer-facing email after payout is released to Stripe Connect.
   *
   * @param input - Payment event data
   * @returns Delivery result without throwing on failure
   */
  async sendPaymentReleasedEmail(input: PaymentEmailInput): Promise<EmailDispatchResult> {
    const disabledResult = this.getDisabledResult(
      'payment.released',
      input.paymentId,
      'payment',
    );
    if (disabledResult) {
      return disabledResult;
    }

    try {
      const admin = createAdminClient();
      const payment = await this.getPaymentSummary(admin, input.paymentId);
      const [caseRow, designer] = await Promise.all([
        this.getCaseSummary(admin, payment.case_id),
        this.getUserProfile(admin, payment.designer_id),
      ]);

      const caseUrl = this.buildCaseUrl(caseRow.id);
      const formattedPayout = this.formatCurrency(
        payment.designer_payout,
        payment.currency,
      );

      return await this.sendTransactionalEmail({
        event: 'payment.released',
        recipientEmail: designer.email,
        recipientUserId: designer.id,
        subject: `Payout released for ${caseRow.title}`,
        html: this.buildHtmlEmail({
          greetingName: designer.full_name,
          intro: `Your payout for "${caseRow.title}" has been released to your connected Stripe account.`,
          details: [['Payout amount', formattedPayout]],
          ctaLabel: 'View Case',
          ctaUrl: caseUrl,
          outro:
            'Stripe will complete the transfer based on your connected account and payout schedule.',
        }),
        text: [
          `Hi ${designer.full_name},`,
          '',
          `Your payout for "${caseRow.title}" has been released to your connected Stripe account.`,
          `Payout amount: ${formattedPayout}`,
          '',
          `View case: ${caseUrl}`,
        ].join('\n'),
        relatedEntityId: payment.id,
        relatedEntityType: 'payment',
      });
    } catch (error) {
      return this.captureEmailFailure(
        error,
        'Failed to prepare payment released email',
        'payment.released',
        input.paymentId,
        'payment',
      );
    }
  }

  private async getUserProfile(
    admin: ReturnType<typeof createAdminClient>,
    userId: string,
  ): Promise<UserEmailProfile> {
    const { data, error } = await admin
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? `Failed to load user ${userId}`);
    }

    return data;
  }

  private async getCaseSummary(
    admin: ReturnType<typeof createAdminClient>,
    caseId: string,
  ): Promise<CaseEmailSummary> {
    const { data, error } = await admin
      .from('cases')
      .select('id, title, currency, client_id')
      .eq('id', caseId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? `Failed to load case ${caseId}`);
    }

    return data;
  }

  private async getPaymentSummary(
    admin: ReturnType<typeof createAdminClient>,
    paymentId: string,
  ): Promise<PaymentEmailSummary> {
    const { data, error } = await admin
      .from('payments')
      .select('id, case_id, client_id, designer_id, amount, designer_payout, currency')
      .eq('id', paymentId)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? `Failed to load payment ${paymentId}`);
    }

    return data;
  }

  private async sendTransactionalEmail(
    payload: TransactionalEmailPayload,
  ): Promise<EmailDispatchResult> {
    const config = this.getConfig();
    const fromAddress = config.fromAddress;

    if (!fromAddress) {
      throw new Error('EMAIL_FROM_ADDRESS is not configured');
    }

    try {
      const response = await this.resend.emails.send({
        from: fromAddress,
        to: payload.recipientEmail,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(config.replyTo ? { replyTo: config.replyTo } : {}),
      });

      if (response.error?.message) {
        throw new Error(response.error.message);
      }

      logServerEvent('info', 'Transactional email sent', {
        context: {
          event: payload.event,
          recipient_user_id: payload.recipientUserId,
          related_entity_id: payload.relatedEntityId,
          related_entity_type: payload.relatedEntityType,
          message_id: response.data?.id ?? null,
        },
      });

      return {
        status: 'sent',
        messageId: response.data?.id ?? null,
      };
    } catch (error) {
      return this.captureEmailFailure(
        error,
        'Transactional email delivery failed',
        payload.event,
        payload.relatedEntityId,
        payload.relatedEntityType,
      );
    }
  }

  private buildHtmlEmail(input: {
    greetingName: string;
    intro: string;
    details: Array<[string, string]>;
    ctaLabel: string;
    ctaUrl: string;
    outro: string;
  }): string {
    const detailRows = input.details
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">${label}</td><td style="padding:4px 0;">${value}</td></tr>`,
      )
      .join('');

    return `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;">
        <p>Hi ${input.greetingName},</p>
        <p>${input.intro}</p>
        <table style="border-collapse:collapse;margin:16px 0;">${detailRows}</table>
        <p style="margin:24px 0;">
          <a href="${input.ctaUrl}" style="background:#1d4ed8;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:8px;display:inline-block;">
            ${input.ctaLabel}
          </a>
        </p>
        <p>${input.outro}</p>
        <p>Thanks,<br />${process.env.NEXT_PUBLIC_APP_NAME ?? 'DentiVerse'}</p>
      </div>
    `.trim();
  }

  private getConfig(): EmailConfig {
    return {
      apiKey: process.env.RESEND_API_KEY ?? null,
      fromAddress: process.env.EMAIL_FROM_ADDRESS ?? null,
      replyTo: process.env.EMAIL_REPLY_TO ?? null,
    };
  }

  private getDisabledResult(
    event: TransactionalEmailPayload['event'],
    relatedEntityId: string,
    relatedEntityType: TransactionalEmailPayload['relatedEntityType'],
  ): EmailDispatchResult | null {
    const config = this.getConfig();
    if (config.apiKey && config.fromAddress) {
      return null;
    }

    const reason = !config.apiKey
      ? 'missing_resend_api_key'
      : 'missing_email_from_address';
    logServerEvent(
      'info',
      'Transactional email skipped because email delivery is disabled',
      {
        context: {
          event,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType,
          reason,
        },
      },
    );

    return {
      status: 'skipped',
      reason,
    };
  }

  private buildCaseUrl(caseId: string): string {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    return `${baseUrl}/cases/${caseId}`;
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  private captureEmailFailure(
    error: unknown,
    message: string,
    event: TransactionalEmailPayload['event'],
    relatedEntityId: string,
    relatedEntityType: TransactionalEmailPayload['relatedEntityType'],
  ): EmailDispatchResult {
    captureServerException(error, message, {
      context: {
        event,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        provider: 'resend',
      },
    });

    return {
      status: 'failed',
      reason: error instanceof Error ? error.message : 'unknown_email_error',
    };
  }
}
