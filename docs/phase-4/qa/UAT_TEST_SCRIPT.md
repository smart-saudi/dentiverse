# DentiVerse — User Acceptance Testing (UAT) Script

> Version 1.0 — March 2026
>
> This script guides beta testers through every critical user flow.
> Testers record results in the table at the end or as GitHub Issues.

---

## Instructions for Testers

1. You'll need two accounts: one as a **Dentist** and one as a **Designer**
2. Follow each scenario step by step
3. Mark each step as PASS, FAIL, or BLOCKED
4. For any FAIL: create a GitHub Issue using the Bug Report template
5. Note any confusing UX, even if functionality works (mark as "UX feedback")

**Test environment:** `https://staging.dentiverse.com`

---

## Scenario 1: Dentist Registration & Profile Setup

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 1.1 | Go to `/register` | Registration page loads with role selection | | |
| 1.2 | Select "Dentist" role, fill in name, email, password | Form validates in real-time (email format, password strength) | | |
| 1.3 | Submit registration | Success message, redirect to email verification prompt | | |
| 1.4 | Check email, click verification link | Email arrives within 2 minutes, link redirects to login | | |
| 1.5 | Login with credentials | Dashboard loads with empty state and welcome message | | |
| 1.6 | Go to Settings → Profile | Profile form with fields for name, phone, country, city | | |
| 1.7 | Upload avatar (JPG, < 5MB) | Avatar uploads, preview shows immediately | | |
| 1.8 | Save profile changes | Success toast, changes persist on page reload | | |

---

## Scenario 2: Create and Publish a Case

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 2.1 | Click "Create New Case" on dashboard | Multi-step form opens (Step 1: Case Details) | | |
| 2.2 | Select case type "Crown", enter title, description | Form accepts input, validates required fields | | |
| 2.3 | Use tooth chart to select tooth #14 | Tooth highlights on chart, number appears in selection | | |
| 2.4 | Set material preference, shade, deadline | Fields populate correctly | | |
| 2.5 | Click "Next" to Step 2: Upload Scans | File upload area appears with drag-and-drop | | |
| 2.6 | Upload an STL file (< 50MB) | Progress bar shows upload, file appears in list on completion | | |
| 2.7 | Click "Next" to Step 3: Budget & Preferences | Budget range slider, software preference, output format | | |
| 2.8 | Set budget $80-$120, select exocad, STL output | Fields save correctly | | |
| 2.9 | Click "Next" to Step 4: Review | Summary of all entered details shown | | |
| 2.10 | Click "Save as Draft" | Case saved with DRAFT status, visible in My Cases | | |
| 2.11 | Open draft case, click "Publish" | Case status changes to OPEN, confirmation message | | |

---

## Scenario 3: Designer Registration & Browse Cases

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 3.1 | Register as Designer (new account) | Registration with role "Designer", email verification | | |
| 3.2 | Complete designer profile (bio, skills, rate) | Profile form with software checkboxes, specializations, hourly rate | | |
| 3.3 | Upload portfolio images | Images upload and display in profile preview | | |
| 3.4 | Set availability to "Available" | Green availability indicator shows on profile | | |
| 3.5 | Go to "Browse Cases" | List of OPEN cases loads with filters | | |
| 3.6 | Filter by case type "Crown" | List filters to show only crown cases | | |
| 3.7 | Filter by budget range $50-$150 | List filters correctly | | |
| 3.8 | Click on the case created in Scenario 2 | Case detail page shows all info including scan files | | |

---

## Scenario 4: Submit and Accept a Proposal

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 4.1 | (As Designer) On case detail, click "Submit Proposal" | Proposal form opens (price, delivery time, message) | | |
| 4.2 | Enter price $95, delivery 18 hours, message (20+ chars) | Form validates inputs | | |
| 4.3 | Submit proposal | Success message, proposal appears in "My Proposals" | | |
| 4.4 | (Switch to Dentist account) Open the case | Proposals tab shows 1 proposal with designer info | | |
| 4.5 | Review proposal: see designer profile, rating, price | All designer details visible, portfolio accessible | | |
| 4.6 | Click "Accept Proposal" | Payment form appears (Stripe Elements) | | |
| 4.7 | Enter test card (4242 4242 4242 4242) | Payment processes, success message | | |
| 4.8 | Case status changes to ASSIGNED | Status badge updates, designer notified | | |
| 4.9 | (As Designer) Check notifications | Notification: "Your proposal was accepted for Case #X" | | |

---

## Scenario 5: Design Submission and Review

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 5.1 | (As Designer) Open assigned case | Case detail with "Upload Design" button visible | | |
| 5.2 | Upload design STL file | File uploads with progress, appears in design files | | |
| 5.3 | Add designer notes, click "Submit Design" | Design version created (v1), case status → REVIEW | | |
| 5.4 | (As Dentist) Check notifications | Notification: "Design submitted for review" | | |
| 5.5 | Open case, go to design review | 3D viewer loads with the STL file | | |
| 5.6 | Rotate, zoom, pan the 3D model | Smooth interaction, model renders correctly | | |
| 5.7 | Click "Request Revision" with feedback (20+ chars) | Case status → REVISION, designer notified | | |
| 5.8 | (As Designer) Read feedback, upload revised design | Design v2 created, status → REVIEW | | |
| 5.9 | (As Dentist) Review v2, click "Approve" | Case status → COMPLETED, payment released | | |
| 5.10 | Check that design files are downloadable | Download link works, STL file opens correctly | | |

---

## Scenario 6: Payment Verification

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 6.1 | (As Dentist) Go to Payment History | Payment shows: amount, case, designer, status "Released" | | |
| 6.2 | Payment amount matches proposal price ($95) | Correct amount displayed | | |
| 6.3 | Platform fee calculated correctly (12% = $11.40) | Fee shown in payment details | | |
| 6.4 | (As Designer) Go to Earnings | Payout shows: $83.60 (95 - 11.40), status | | |
| 6.5 | Receipt/invoice available for download | PDF or formatted receipt accessible | | |

---

## Scenario 7: Messaging

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 7.1 | (As Dentist) Open case, go to Messages tab | Chat thread loads (may be empty or have system messages) | | |
| 7.2 | Send a text message | Message appears instantly in thread | | |
| 7.3 | (As Designer) Open same case messages | Dentist's message visible, marked as unread initially | | |
| 7.4 | Designer replies | Reply appears in real-time (no page refresh needed) | | |
| 7.5 | (As Dentist) See designer's reply in real-time | Message appears without refresh (Supabase Realtime) | | |
| 7.6 | Send a message with file attachment | File uploads, appears as clickable attachment in thread | | |

---

## Scenario 8: Review & Rating

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 8.1 | (As Dentist) After case completion, prompt to leave review | Review form appears (stars + text) | | |
| 8.2 | Rate: overall 5, accuracy 4, speed 5, communication 5 | Stars interactive, all 4 dimensions selectable | | |
| 8.3 | Write a comment and submit | Review saved, visible on designer's profile | | |
| 8.4 | (As Designer) View own profile | New review visible, average rating updated | | |
| 8.5 | Designer responds to review | Response text appears under the review | | |

---

## Scenario 9: Edge Cases & Error Handling

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 9.1 | Try to create a case without required fields | Validation errors shown per field, form doesn't submit | | |
| 9.2 | Try to upload a non-STL file (e.g., .exe) | Rejection message: "File type not supported" | | |
| 9.3 | Try to upload a file > 500MB | Rejection message: "File too large (max 500MB)" | | |
| 9.4 | Try to access another user's case via URL | 404 or 403 error page, not the case details | | |
| 9.5 | Try to submit a proposal on your own case | Error: "You cannot submit a proposal on your own case" | | |
| 9.6 | Try to approve a design that doesn't exist | Error handled gracefully | | |
| 9.7 | Disconnect internet during file upload | Upload pauses, resumes when reconnected (Uppy resumable) | | |
| 9.8 | Open the same case in two tabs, approve in one | Second tab refreshes or shows updated status | | |
| 9.9 | Test with slow 3G network (Chrome DevTools throttle) | App loads within 5s, shows loading skeletons | | |

---

## Scenario 10: Responsive Design

| # | Step | Expected Result | Pass/Fail | Notes |
|---|------|----------------|-----------|-------|
| 10.1 | Dashboard on mobile (375px) | Single-column layout, hamburger menu, all content accessible | | |
| 10.2 | Case creation form on mobile | Multi-step form usable, tooth chart scrollable/zoomable | | |
| 10.3 | Designer search on tablet (768px) | 2-column card grid, filters in collapsible sidebar | | |
| 10.4 | 3D viewer on mobile | Model loads, touch gestures work (pinch zoom, swipe rotate) | | |
| 10.5 | Chat thread on mobile | Full-screen chat, keyboard doesn't obscure input field | | |

---

## Results Summary

Fill this after testing:

| Scenario | Total Steps | Pass | Fail | Blocked | Issues Filed |
|----------|------------|------|------|---------|--------------|
| 1. Registration | 8 | | | | |
| 2. Create Case | 11 | | | | |
| 3. Designer Browse | 8 | | | | |
| 4. Proposals | 9 | | | | |
| 5. Design Review | 10 | | | | |
| 6. Payment | 5 | | | | |
| 7. Messaging | 6 | | | | |
| 8. Reviews | 5 | | | | |
| 9. Edge Cases | 9 | | | | |
| 10. Responsive | 5 | | | | |
| **TOTAL** | **76** | | | | |

**Tester:** _______________
**Date:** _______________
**Environment:** Staging / Production
**Browser:** _______________
**Overall Assessment:** Ready for launch / Needs fixes / Major issues
