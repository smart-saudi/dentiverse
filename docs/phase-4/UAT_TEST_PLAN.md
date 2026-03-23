# DentiVerse — User Acceptance Testing (UAT) Plan

> Last updated: 2026-03-23
> Status: Ready for execution
> Bug Tracker: [GitHub Issues](https://github.com/smart-saudi/dentiverse/issues) with `uat` label

---

## 1. Overview

This UAT plan validates that DentiVerse meets business requirements from the perspective of real users before production launch. Each scenario maps to a core user flow and must be verified by a tester acting as the specified role.

### UAT Participants

| Role | Tester | Responsibility |
|------|--------|---------------|
| Dentist (client) | Beta tester 1 | Create cases, review proposals, approve designs, make payments |
| Designer | Beta tester 2 | Browse cases, submit proposals, upload designs |
| Lab manager | Beta tester 3 | Create cases on behalf of dentists |
| Admin | Project owner | Verify admin operations and oversight |

### Bug Severity Definitions

| Severity | Definition | SLA | Release Impact |
|----------|-----------|-----|---------------|
| **Critical** | Data loss, security vulnerability, payment failure, complete feature broken | Fix within 24hr | **Blocks release** |
| **High** | Major feature broken, no workaround available | Fix within 48hr | **Blocks release** |
| **Medium** | Feature partially broken but workaround exists | Fix within 1 week | Ship, fix in next sprint |
| **Low** | Cosmetic issue, minor inconvenience | Fix in backlog | Ship as-is |

---

## 2. Test Scenarios

### S1: New User Registration & Email Verification
**Role**: Public (new user)
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1.1 | Navigate to `/register` | Registration form loads with role selector | |
| 1.2 | Enter name, email, password, select "Dentist" role | Form validates in real-time | |
| 1.3 | Submit with password < 8 chars | Error: "Password must be at least 8 characters" | |
| 1.4 | Submit with valid data | Success message, redirect to login | |
| 1.5 | Check email inbox | Verification email received | |
| 1.6 | Click verification link | Account verified, can log in | |
| 1.7 | Register with same email again | Error: "User already exists" | |

### S2: Login / Logout / Password Reset
**Role**: Registered user
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 2.1 | Navigate to `/login` | Login form loads | |
| 2.2 | Enter wrong password | Error: "Invalid credentials" | |
| 2.3 | Enter correct credentials | Redirect to dashboard | |
| 2.4 | Click logout | Redirect to login page, session cleared | |
| 2.5 | Navigate to `/forgot-password` | Forgot password form loads | |
| 2.6 | Enter registered email | Success: "Check your email" (no leak of existence) | |
| 2.7 | Enter non-existent email | Same success message (no leak) | |
| 2.8 | Click reset link from email | Reset password form loads | |
| 2.9 | Set new password | Success, can login with new password | |

### S3: Dentist Creates and Publishes a Case
**Role**: Dentist
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 3.1 | Navigate to `/cases/new` | Case creation form loads | |
| 3.2 | Fill in title, type, tooth numbers | Fields validated, tooth chart interactive | |
| 3.3 | Upload dental scan (STL file, ~20MB) | Upload progress shown, file appears in list | |
| 3.4 | Submit case | Case created in DRAFT status, redirect to case detail | |
| 3.5 | View case at `/cases/[id]` | All details shown, status badge says "Draft" | |
| 3.6 | Click "Publish" | Status changes to "Open", visible to designers | |
| 3.7 | Navigate to `/cases` | Published case appears in case list | |

### S4: Designer Browses Cases and Submits Proposal
**Role**: Designer
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 4.1 | Navigate to `/cases` | List of open cases visible | |
| 4.2 | Filter by case type | List filtered correctly | |
| 4.3 | Click on a case | Case detail page loads with all info | |
| 4.4 | View dental scan in 3D viewer | STL file renders, can rotate/zoom | |
| 4.5 | Click "Submit Proposal" | Proposal form opens | |
| 4.6 | Enter price, estimated days, message | Fields validated | |
| 4.7 | Submit proposal | Proposal created, shown in proposals list | |
| 4.8 | Navigate to `/proposals` | "My Proposals" page shows submitted proposal | |

### S5: Dentist Reviews and Accepts Proposal
**Role**: Dentist
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 5.1 | Receive notification about new proposal | Notification bell shows unread count | |
| 5.2 | Click notification | Navigates to case detail | |
| 5.3 | View proposals tab | Proposal from designer visible with price/timeline | |
| 5.4 | Click "Accept Proposal" | Case status changes to "Assigned" | |
| 5.5 | Other proposals auto-rejected | Rejected proposals show "Rejected" badge | |

### S6: Designer Uploads Design Version
**Role**: Designer (assigned)
**Priority**: High

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 6.1 | Open assigned case | Case detail with "Upload Design" option | |
| 6.2 | Upload design file (STL) | File uploads, version created | |
| 6.3 | Add version notes | Notes saved with version | |
| 6.4 | Dentist receives notification | Notification: "Design submitted for review" | |

### S7: Dentist Reviews Design
**Role**: Dentist
**Priority**: High

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 7.1 | Open case with submitted design | Design version visible with 3D viewer | |
| 7.2 | View design in 3D viewer | STL renders correctly | |
| 7.3 | Click "Request Revision" + add notes | Status updates, designer notified | |
| 7.4 | Designer uploads revision | New version appears in history | |
| 7.5 | Click "Approve Design" | Case status changes to "Completed" | |

### S8: Payment Escrow Flow
**Role**: Dentist + Designer
**Priority**: Critical

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 8.1 | Dentist initiates payment after accepting proposal | Payment form with Stripe Elements | |
| 8.2 | Enter test card (4242...) | Payment processed, status "Held" | |
| 8.3 | After design approval, payment released | Status "Released", designer payout initiated | |
| 8.4 | Designer sees earnings | Earnings page shows correct payout (amount - 12% fee) | |
| 8.5 | View payment history | `/payments` shows transaction with correct amounts | |

### S9: Real-Time Messaging
**Role**: Dentist + Designer
**Priority**: High

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 9.1 | Open case chat | Message thread loads | |
| 9.2 | Send message as dentist | Message appears in thread immediately | |
| 9.3 | Designer sees message in real-time | No page refresh needed | |
| 9.4 | Designer replies | Reply appears for both parties | |
| 9.5 | Scroll through message history | Pagination loads older messages | |

### S10: Notifications
**Role**: All roles
**Priority**: Medium

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 10.1 | Trigger event (new proposal, message, etc.) | Notification bell updates with count | |
| 10.2 | Click bell icon | Dropdown shows recent notifications | |
| 10.3 | Click "Mark all as read" | Badge clears, notifications marked | |
| 10.4 | Navigate to `/notifications` | Full notification history with pagination | |
| 10.5 | Filter by unread | Only unread notifications shown | |

### S11: File Upload
**Role**: All roles
**Priority**: High

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 11.1 | Upload STL file (< 100MB) | Upload succeeds with progress indicator | |
| 11.2 | Upload file > 100MB | Error: "File too large" | |
| 11.3 | Upload non-allowed file type (.exe) | Error: "File type not allowed" | |
| 11.4 | Upload portfolio image (JPEG, PNG) | Image uploaded and displayed | |

### S12: 3D Viewer
**Role**: Dentist + Designer
**Priority**: Medium

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 12.1 | Open STL file in viewer | 3D model renders within 3 seconds | |
| 12.2 | Rotate model (click + drag) | Model rotates smoothly | |
| 12.3 | Zoom (scroll wheel) | Model zooms in/out | |
| 12.4 | Reset view | Model returns to default position | |

### S13: Designer Profile & Portfolio
**Role**: Designer
**Priority**: Medium

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 13.1 | Navigate to `/settings/profile` | Profile form loads with current data | |
| 13.2 | Update bio, specializations | Changes saved | |
| 13.3 | Upload portfolio images | Images appear on public profile | |
| 13.4 | View own public profile | All info displayed correctly | |
| 13.5 | Other user views profile at `/designers/[id]` | Public info visible, private info hidden | |

### S14: Settings
**Role**: All roles
**Priority**: Low

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 14.1 | Navigate to `/settings` | Settings page loads | |
| 14.2 | Update profile info | Changes saved and reflected | |

### S15: Mobile Responsiveness
**Role**: All roles
**Priority**: Medium

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 15.1 | Open app at 375px width | Sidebar collapses, hamburger menu visible | |
| 15.2 | Open hamburger menu | Mobile nav slides in | |
| 15.3 | Navigate through main flows | All pages usable on mobile | |
| 15.4 | Test at 768px (tablet) | Layout adapts correctly | |

### S16: Cross-Browser
**Role**: QA
**Priority**: Medium

| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 16.1 | Chrome (latest) | All features work | |
| 16.2 | Firefox (latest) | All features work | |
| 16.3 | Safari (latest) | All features work | |
| 16.4 | Edge (latest) | All features work | |
| 16.5 | iOS Safari | Core flows work | |
| 16.6 | Android Chrome | Core flows work | |

---

## 3. Release Criteria

### Must Pass (Release Blockers)
- [ ] S1: User registration works end-to-end
- [ ] S2: Login/logout/password reset works
- [ ] S3: Case creation and publishing works
- [ ] S4: Designer can browse and submit proposals
- [ ] S5: Proposal acceptance works
- [ ] S8: Payment escrow flow completes (hold → release)
- [ ] Zero Critical severity bugs
- [ ] Zero High severity bugs (or all have approved workarounds)

### Should Pass (Launch Quality)
- [ ] S6–S7: Design version upload and review
- [ ] S9: Real-time messaging
- [ ] S10: Notifications
- [ ] S11: File upload all types
- [ ] S15: Mobile responsive

### Nice to Have
- [ ] S12: 3D viewer smooth performance
- [ ] S13: Designer portfolio management
- [ ] S16: Full cross-browser compatibility

---

## 4. Bug Reporting Process

1. **Report**: Use the [UAT Finding template](https://github.com/smart-saudi/dentiverse/issues/new?template=uat-finding.yml) on GitHub Issues
2. **Triage**: Project owner reviews within 24hr, assigns severity label
3. **Fix**: Developer picks up based on severity SLA
4. **Verify**: Original reporter re-tests and closes issue
5. **Track**: Monitor [UAT issues board](https://github.com/smart-saudi/dentiverse/issues?q=label%3Auat) for overall progress

### Labels Used

| Label | Purpose |
|-------|---------|
| `uat` | All UAT findings |
| `severity: critical` | Release blocker — data/security/payment |
| `severity: high` | Must fix before launch |
| `severity: medium` | Fix in next sprint |
| `severity: low` | Cosmetic, backlog |
| `area: *` | Component area (auth, cases, payments, etc.) |
