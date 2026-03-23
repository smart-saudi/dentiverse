-- ============================================================
-- DentiVerse — Database Schema Definition
-- PostgreSQL 16 (Supabase)
-- Version: 1.0
-- Date: 2026-03-22
-- ============================================================
-- Run this BEFORE any application code. This is the source of
-- truth for all data structures. Do NOT write ad-hoc migrations.
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "moddatetime";     -- Auto-update updated_at

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('DENTIST', 'LAB', 'DESIGNER', 'ADMIN');

CREATE TYPE case_status AS ENUM (
  'DRAFT',
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'REVIEW',
  'REVISION',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED'
);

CREATE TYPE case_type AS ENUM (
  'CROWN',
  'BRIDGE',
  'IMPLANT',
  'VENEER',
  'INLAY',
  'ONLAY',
  'DENTURE',
  'OTHER'
);

CREATE TYPE proposal_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

CREATE TYPE design_version_status AS ENUM ('SUBMITTED', 'APPROVED', 'REVISION_REQUESTED');

CREATE TYPE payment_status AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');

CREATE TYPE notification_type AS ENUM (
  'NEW_PROPOSAL',
  'DESIGN_SUBMITTED',
  'REVISION_REQUESTED',
  'PAYMENT_RELEASED',
  'NEW_MESSAGE',
  'CASE_ASSIGNED',
  'CASE_COMPLETED',
  'REVIEW_RECEIVED'
);

-- ============================================================
-- 2. TABLES
-- ============================================================

-- --------------------------------------------------------
-- 2.1 USERS
-- Central user table. Extends Supabase auth.users.
-- --------------------------------------------------------
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  full_name       VARCHAR(255) NOT NULL,
  role            user_role NOT NULL,
  avatar_url      TEXT,
  phone           VARCHAR(30),
  country         VARCHAR(2),          -- ISO 3166-1 alpha-2
  city            VARCHAR(100),
  timezone        VARCHAR(50) DEFAULT 'UTC',
  preferred_lang  VARCHAR(5) DEFAULT 'en',
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_account_id  VARCHAR(255),     -- Stripe Connect (designers)
  stripe_customer_id VARCHAR(255),     -- Stripe Customer (clients)
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_email_trgm ON users USING GIN (email gin_trgm_ops);

-- --------------------------------------------------------
-- 2.2 DESIGNER_PROFILES
-- Extended profile for designers. 1:1 with users.
-- --------------------------------------------------------
CREATE TABLE designer_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio                 TEXT,
  software_skills     JSONB NOT NULL DEFAULT '[]',
  -- e.g. ["exocad", "3shape", "dental_wings", "medit"]
  specializations     JSONB NOT NULL DEFAULT '[]',
  -- e.g. ["crowns", "bridges", "implants", "dentures", "veneers"]
  years_experience    INTEGER DEFAULT 0 CHECK (years_experience >= 0),
  hourly_rate         DECIMAL(10,2) CHECK (hourly_rate >= 0),
  portfolio_urls      JSONB NOT NULL DEFAULT '[]',
  sample_case_ids     JSONB NOT NULL DEFAULT '[]',
  avg_rating          DECIMAL(3,2) DEFAULT 0.00 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  total_reviews       INTEGER NOT NULL DEFAULT 0,
  total_cases         INTEGER NOT NULL DEFAULT 0,
  completed_cases     INTEGER NOT NULL DEFAULT 0,
  avg_delivery_hours  DECIMAL(5,1) DEFAULT 0.0,
  is_available        BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  languages           JSONB NOT NULL DEFAULT '["en"]',
  certifications      JSONB NOT NULL DEFAULT '[]',
  response_rate       DECIMAL(5,2) DEFAULT 0.00,  -- % of proposals responded to
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_designer_profiles_user ON designer_profiles(user_id);
CREATE INDEX idx_designer_profiles_available ON designer_profiles(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_designer_profiles_rating ON designer_profiles(avg_rating DESC);
CREATE INDEX idx_designer_profiles_software ON designer_profiles USING GIN (software_skills);
CREATE INDEX idx_designer_profiles_specializations ON designer_profiles USING GIN (specializations);

-- --------------------------------------------------------
-- 2.3 CASES (Orders)
-- Core marketplace transaction.
-- --------------------------------------------------------
CREATE TABLE cases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  designer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  status              case_status NOT NULL DEFAULT 'DRAFT',
  case_type           case_type NOT NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT,
  tooth_numbers       JSONB NOT NULL DEFAULT '[]',    -- FDI notation, e.g. [11, 12, 21]
  material_preference VARCHAR(100),                    -- "zirconia", "emax", "pmma", etc.
  shade               VARCHAR(20),                     -- e.g. "A2", "B1"
  scan_file_urls      JSONB NOT NULL DEFAULT '[]',
  design_file_urls    JSONB NOT NULL DEFAULT '[]',
  reference_images    JSONB NOT NULL DEFAULT '[]',
  budget_min          DECIMAL(10,2) CHECK (budget_min >= 0),
  budget_max          DECIMAL(10,2) CHECK (budget_max >= budget_min),
  agreed_price        DECIMAL(10,2) CHECK (agreed_price >= 0),
  currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
  deadline            TIMESTAMPTZ,
  urgency             VARCHAR(20) DEFAULT 'normal',    -- "normal", "urgent", "rush"
  special_instructions TEXT,
  software_required   VARCHAR(50),                     -- "exocad", "3shape", etc.
  output_format       VARCHAR(20) DEFAULT 'STL',       -- "STL", "OBJ", "PLY", "DCM"
  max_revisions       INTEGER NOT NULL DEFAULT 2,
  revision_count      INTEGER NOT NULL DEFAULT 0,
  assigned_at         TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,                     -- When first design submitted
  delivered_at        TIMESTAMPTZ,                     -- When final design delivered
  approved_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_designer ON cases(designer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_type ON cases(case_type);
CREATE INDEX idx_cases_created ON cases(created_at DESC);
CREATE INDEX idx_cases_open ON cases(status, created_at DESC) WHERE status = 'OPEN';
CREATE INDEX idx_cases_title_trgm ON cases USING GIN (title gin_trgm_ops);

-- --------------------------------------------------------
-- 2.4 PROPOSALS (Bids)
-- Designers submit proposals on open cases.
-- --------------------------------------------------------
CREATE TABLE proposals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  designer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price             DECIMAL(10,2) NOT NULL CHECK (price > 0),
  estimated_hours   DECIMAL(5,1) NOT NULL CHECK (estimated_hours > 0),
  message           TEXT NOT NULL,
  status            proposal_status NOT NULL DEFAULT 'PENDING',
  accepted_at       TIMESTAMPTZ,
  rejected_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, designer_id)        -- One proposal per designer per case
);

CREATE INDEX idx_proposals_case ON proposals(case_id);
CREATE INDEX idx_proposals_designer ON proposals(designer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_pending ON proposals(case_id, status) WHERE status = 'PENDING';

-- --------------------------------------------------------
-- 2.5 DESIGN_VERSIONS
-- Tracks each iteration of a design.
-- --------------------------------------------------------
CREATE TABLE design_versions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  designer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version_number      INTEGER NOT NULL CHECK (version_number >= 1),
  file_urls           JSONB NOT NULL DEFAULT '[]',
  thumbnail_url       TEXT,
  preview_model_url   TEXT,            -- Pre-processed 3D model for viewer
  notes               TEXT,
  status              design_version_status NOT NULL DEFAULT 'SUBMITTED',
  revision_feedback   TEXT,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, version_number)     -- Enforce sequential versioning
);

CREATE INDEX idx_design_versions_case ON design_versions(case_id);
CREATE INDEX idx_design_versions_latest ON design_versions(case_id, version_number DESC);

-- --------------------------------------------------------
-- 2.6 PAYMENTS
-- Financial transactions linked to Stripe.
-- --------------------------------------------------------
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id             UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE RESTRICT,
  client_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  designer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount              DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  platform_fee        DECIMAL(10,2) NOT NULL CHECK (platform_fee >= 0),
  designer_payout     DECIMAL(10,2) NOT NULL CHECK (designer_payout >= 0),
  currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
  fee_percentage      DECIMAL(5,2) NOT NULL DEFAULT 12.00,  -- Platform commission %
  status              payment_status NOT NULL DEFAULT 'PENDING',
  stripe_payment_intent_id  VARCHAR(255),
  stripe_charge_id          VARCHAR(255),
  stripe_transfer_id        VARCHAR(255),
  stripe_refund_id          VARCHAR(255),
  held_at             TIMESTAMPTZ,
  released_at         TIMESTAMPTZ,
  refunded_at         TIMESTAMPTZ,
  failure_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_case ON payments(case_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_designer ON payments(designer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_pi ON payments(stripe_payment_intent_id);

-- --------------------------------------------------------
-- 2.7 REVIEWS
-- Client reviews of designers after case completion.
-- --------------------------------------------------------
CREATE TABLE reviews (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id               UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  reviewer_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designer_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_rating        INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  accuracy_rating       INTEGER NOT NULL CHECK (accuracy_rating BETWEEN 1 AND 5),
  speed_rating          INTEGER NOT NULL CHECK (speed_rating BETWEEN 1 AND 5),
  communication_rating  INTEGER NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  comment               TEXT,
  is_public             BOOLEAN NOT NULL DEFAULT TRUE,
  designer_response     TEXT,          -- Designer can respond to review
  responded_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_designer ON reviews(designer_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(designer_id, overall_rating DESC);

-- --------------------------------------------------------
-- 2.8 MESSAGES
-- In-platform messaging tied to specific cases.
-- --------------------------------------------------------
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id         UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  attachment_urls  JSONB NOT NULL DEFAULT '[]',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  is_system       BOOLEAN NOT NULL DEFAULT FALSE,  -- System-generated messages
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_case ON messages(case_id, created_at ASC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(case_id, is_read) WHERE is_read = FALSE;

-- --------------------------------------------------------
-- 2.9 NOTIFICATIONS
-- Push/email/in-app notifications.
-- --------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       VARCHAR(255) NOT NULL,
  body        TEXT,
  case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  action_url  TEXT,                       -- Deep link
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  is_emailed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- --------------------------------------------------------
-- 2.10 AUDIT_LOG
-- Immutable log of important actions for compliance.
-- --------------------------------------------------------
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,     -- e.g. "case.created", "payment.released"
  entity_type VARCHAR(50) NOT NULL,      -- e.g. "case", "payment", "user"
  entity_id   UUID NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at DESC);

-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- Auto-update updated_at on all tables with the column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_designer_profiles_updated_at
  BEFORE UPDATE ON designer_profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Update designer avg_rating when a new review is added
CREATE OR REPLACE FUNCTION update_designer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE designer_profiles
  SET
    avg_rating = (
      SELECT ROUND(AVG(overall_rating)::NUMERIC, 2)
      FROM reviews
      WHERE designer_id = NEW.designer_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE designer_id = NEW.designer_id
    )
  WHERE user_id = NEW.designer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_designer_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_designer_rating();

-- Increment designer completed_cases on case completion
CREATE OR REPLACE FUNCTION update_designer_case_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' AND NEW.designer_id IS NOT NULL THEN
    UPDATE designer_profiles
    SET
      completed_cases = completed_cases + 1,
      total_cases = total_cases + 1
    WHERE user_id = NEW.designer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_designer_case_count
  AFTER UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_designer_case_count();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- USERS: Everyone can read public profiles, users can update their own
CREATE POLICY users_select ON users FOR SELECT USING (TRUE);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

-- DESIGNER_PROFILES: Public read, owner update
CREATE POLICY designer_profiles_select ON designer_profiles FOR SELECT USING (TRUE);
CREATE POLICY designer_profiles_insert ON designer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY designer_profiles_update ON designer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- CASES: Clients see own cases, designers see assigned + open cases
CREATE POLICY cases_select_client ON cases FOR SELECT
  USING (auth.uid() = client_id);
CREATE POLICY cases_select_designer ON cases FOR SELECT
  USING (auth.uid() = designer_id OR status = 'OPEN');
CREATE POLICY cases_insert ON cases FOR INSERT
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY cases_update_client ON cases FOR UPDATE
  USING (auth.uid() = client_id);
CREATE POLICY cases_update_designer ON cases FOR UPDATE
  USING (auth.uid() = designer_id);

-- PROPOSALS: Designers see own, clients see proposals on their cases
CREATE POLICY proposals_select_designer ON proposals FOR SELECT
  USING (auth.uid() = designer_id);
CREATE POLICY proposals_select_client ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = proposals.case_id AND cases.client_id = auth.uid()
    )
  );
CREATE POLICY proposals_insert ON proposals FOR INSERT
  WITH CHECK (auth.uid() = designer_id);
CREATE POLICY proposals_update ON proposals FOR UPDATE
  USING (auth.uid() = designer_id);

-- DESIGN_VERSIONS: Case participants only
CREATE POLICY design_versions_select ON design_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = design_versions.case_id
        AND (cases.client_id = auth.uid() OR cases.designer_id = auth.uid())
    )
  );
CREATE POLICY design_versions_insert ON design_versions FOR INSERT
  WITH CHECK (auth.uid() = designer_id);

-- PAYMENTS: Case participants only
CREATE POLICY payments_select ON payments FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = designer_id);

-- REVIEWS: Public read, reviewer can insert/update own
CREATE POLICY reviews_select ON reviews FOR SELECT USING (is_public = TRUE);
CREATE POLICY reviews_insert ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY reviews_update ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR auth.uid() = designer_id);

-- MESSAGES: Case participants only
CREATE POLICY messages_select ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = messages.case_id
        AND (cases.client_id = auth.uid() OR cases.designer_id = auth.uid())
    )
  );
CREATE POLICY messages_insert ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- NOTIFICATIONS: Own only
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- AUDIT_LOG: Admin only (handled via service role key)
CREATE POLICY audit_log_select ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- ============================================================
-- 6. STORAGE BUCKETS (Supabase Storage)
-- ============================================================
-- These are created via Supabase Dashboard or CLI, documented here:
--
-- Bucket: dental-scans
--   Access: Private (signed URLs only)
--   Max file size: 500MB
--   Allowed MIME: application/octet-stream, model/stl, model/obj
--   Policy: Only case client + assigned designer can access
--
-- Bucket: design-files
--   Access: Private (signed URLs only)
--   Max file size: 500MB
--   Allowed MIME: application/octet-stream, model/stl, model/obj
--   Policy: Only case client + assigned designer can access
--
-- Bucket: avatars
--   Access: Public
--   Max file size: 5MB
--   Allowed MIME: image/jpeg, image/png, image/webp
--
-- Bucket: portfolios
--   Access: Public
--   Max file size: 50MB
--   Allowed MIME: image/jpeg, image/png, image/webp, model/stl
--
-- Bucket: message-attachments
--   Access: Private
--   Max file size: 50MB
--   Policy: Only case participants can access

-- ============================================================
-- END OF SCHEMA
-- ============================================================
