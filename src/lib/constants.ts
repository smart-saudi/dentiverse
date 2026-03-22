/**
 * Application-wide constants.
 * NEVER hard-code these values elsewhere — import from here.
 */

/** Application metadata */
export const APP_NAME = 'DentiVerse';
export const APP_DESCRIPTION =
  'The marketplace connecting dental professionals with expert digital designers.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

/** Platform fee percentage (12%) */
export const PLATFORM_FEE_PERCENT = 12;

/** User roles */
export const UserRole = {
  DENTIST: 'DENTIST',
  LAB: 'LAB',
  DESIGNER: 'DESIGNER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Case statuses */
export const CaseStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;
export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

/** Proposal statuses */
export const ProposalStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus];

/** Payment statuses */
export const PaymentStatus = {
  PENDING: 'PENDING',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/** Case types (dental work types) */
export const CaseType = {
  CROWN: 'CROWN',
  BRIDGE: 'BRIDGE',
  VENEER: 'VENEER',
  IMPLANT: 'IMPLANT',
  DENTURE: 'DENTURE',
  INLAY_ONLAY: 'INLAY_ONLAY',
  ORTHODONTIC: 'ORTHODONTIC',
  SURGICAL_GUIDE: 'SURGICAL_GUIDE',
  OTHER: 'OTHER',
} as const;
export type CaseType = (typeof CaseType)[keyof typeof CaseType];

/** File upload limits */
export const FILE_LIMITS = {
  MAX_FILE_SIZE_MB: 100,
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_SCAN_EXTENSIONS: ['.stl', '.obj', '.ply', '.dcm'],
  ALLOWED_DESIGN_EXTENSIONS: ['.stl', '.obj', '.ply', '.zip'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  ALLOWED_AVATAR_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

/** Supabase storage bucket names */
export const StorageBucket = {
  DENTAL_SCANS: 'dental-scans',
  DESIGN_FILES: 'design-files',
  AVATARS: 'avatars',
  PORTFOLIOS: 'portfolios',
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
  MAX_PER_PAGE: 100,
} as const;
