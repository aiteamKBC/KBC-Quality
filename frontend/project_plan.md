# KBC Quality and Ofsted Readiness Platform

## 1. Project Description

An internal enterprise web application for Kent Business College, giving leadership, quality, safeguarding, compliance, and delivery teams a single unified platform to monitor learner progress, employer engagement, risks, actions, evidence, and Ofsted inspection readiness. The platform integrates multiple data sources (APTEM, LMS, M365, Zoho Forms, manual uploads) and provides role-based access to sensitive information.

**Target Users:** KBC internal staff across roles: Director, Quality Lead, Compliance Lead, Programme Lead, Coach, IQA, Safeguarding Lead, Employer Engagement Officer, Admin, Read-Only Inspector

**Core Value:** One inspection-ready operational hub for all quality assurance, compliance, safeguarding, and performance data.

---

## 2. Page Structure

- `/` - Redirect to dashboard
- `/dashboard` - Executive Dashboard
- `/ofsted` - Ofsted Inspection Dashboard
- `/learners` - Learner List
- `/learners/:id` - Learner 360 Profile
- `/employers` - Employer List
- `/employers/:id` - Employer 360 Profile
- `/evidence` - Evidence Vault
- `/actions` - Actions and Improvement Tracker
- `/safeguarding` - Safeguarding Dashboard
- `/quality` - Quality Dashboard
- `/compliance` - Compliance Dashboard
- `/reports` - Reports and Exports
- `/settings` - Settings (users, roles, integrations)
- `/login` - Authentication

---

## 3. Core Features

- [ ] App shell: left sidebar nav, top header, responsive layout
- [ ] Role-based access control (10 roles)
- [ ] Executive Dashboard with KPI cards and RAG status
- [ ] Ofsted Inspection Dashboard with readiness score
- [ ] Learner 360 Profile (tabs: overview, attendance, OTJH, reviews, notes, evidence, actions, timeline)
- [ ] Employer 360 Profile (tabs: overview, learners, communications, actions, timeline)
- [ ] Evidence Vault with drag-and-drop upload, categories, tags, search
- [ ] Actions & Improvement Tracker (table + board views)
- [ ] Safeguarding Dashboard (privacy-sensitive, restricted access)
- [ ] Quality Dashboard (attendance, engagement, progress reviews, OTJH, coach performance)
- [ ] Compliance Dashboard (missing docs, overdue items, risk flags)
- [ ] Reports & Exports (prebuilt + custom, CSV + PDF)
- [ ] Global search across all records
- [ ] Alerts panel (overdue reviews, missing signatures, inactive learners, low OTJH)
- [ ] AI-generated summaries (evidence, notes, transcripts)
- [ ] Learner and employer timeline components
- [ ] RAG indicators throughout
- [ ] Audit trail
- [ ] Realistic seeded demo data

---

## 4. Data Model Design

### Table: profiles
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | FK to auth.users |
| full_name | text | Display name |
| role | text | Director, Quality Lead, etc. |
| email | text | |
| avatar_url | text | |
| created_at | timestamptz | |

### Table: programmes
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| name | text | Programme name |
| framework | text | e.g. L3 Business Admin |
| cohort | text | Cohort label |
| start_date | date | |
| end_date | date | |
| lead_id | uuid | FK profiles |

### Table: learners
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| full_name | text | |
| email | text | |
| programme_id | uuid | FK programmes |
| employer_id | uuid | FK employers |
| coach_id | uuid | FK profiles |
| start_date | date | |
| expected_end_date | date | |
| attendance_pct | numeric | |
| otjh_logged | numeric | Hours logged |
| otjh_target | numeric | Required hours |
| rag_status | text | Red/Amber/Green |
| risk_flags | text[] | Array of flags |
| is_active | boolean | |
| created_at | timestamptz | |

### Table: employers
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| name | text | |
| contact_name | text | |
| contact_email | text | |
| sector | text | |
| engagement_score | numeric | 0-100 |
| rag_status | text | |
| created_at | timestamptz | |

### Table: evidence
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| title | text | |
| category | text | |
| tags | text[] | |
| file_url | text | Supabase storage |
| linked_learner_id | uuid | nullable |
| linked_employer_id | uuid | nullable |
| uploaded_by | uuid | FK profiles |
| review_status | text | pending/verified |
| created_at | timestamptz | |

### Table: actions
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| title | text | |
| description | text | |
| owner_id | uuid | FK profiles |
| linked_learner_id | uuid | nullable |
| linked_employer_id | uuid | nullable |
| due_date | date | |
| priority | text | Low/Medium/High/Critical |
| status | text | Open/In Progress/Completed/Escalated |
| created_by | uuid | FK profiles |
| created_at | timestamptz | |

### Table: safeguarding_cases
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| learner_id | uuid | FK learners |
| severity | text | Low/Medium/High/Critical |
| category | text | |
| status | text | Open/Active/Resolved |
| description | text | |
| assigned_to | uuid | FK profiles |
| created_at | timestamptz | |

### Table: progress_reviews
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| learner_id | uuid | FK learners |
| review_date | date | |
| coach_id | uuid | FK profiles |
| status | text | Completed/Overdue/Upcoming |
| notes | text | |
| signed | boolean | |

### Table: timeline_events
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| entity_type | text | learner/employer |
| entity_id | uuid | |
| event_type | text | note/review/email/upload/action |
| title | text | |
| body | text | |
| created_by | uuid | FK profiles |
| created_at | timestamptz | |

---

## 5. Backend / Third-party Integration Plan

- **Supabase Auth**: Email/password login, JWT-based sessions, role stored in profiles table
- **Supabase PostgreSQL**: All application data as modelled above
- **Supabase Storage**: Evidence file uploads (bucket: `evidence-files`)
- **Supabase Edge Functions**: 
  - AI summary generation (OpenAI)
  - APTEM API sync
  - PDF/CSV report generation
  - Zoho Forms webhook receiver
- **Row Level Security (RLS)**: Per-table policies based on role from profiles
- **APTEM API**: Learner data sync (future integration)
- **Microsoft 365**: Email/communication data (future)
- **Zoho Forms**: Webhooks for form submissions
- **LMS**: Progress and engagement data

---

## 6. Development Phase Plan

### Phase 1: App Shell + Navigation + Login Page
- Goal: Build the full app structure — sidebar, header, routing, login page
- Deliverable: Working navigation between all pages, login screen, placeholder page templates

### Phase 2: Executive Dashboard + Ofsted Dashboard
- Goal: Core dashboards with KPI cards, RAG status, charts, alerts
- Deliverable: Two fully built dashboard pages with realistic seeded data

### Phase 3: Learner List + Learner 360 Profile
- Goal: Learner management pages with full 360 tab views
- Deliverable: Learner list with filters, individual learner profile with all tabs

### Phase 4: Employer List + Employer 360 Profile
- Goal: Employer pages with linked learners, engagement score, timeline
- Deliverable: Employer list and 360 profile page

### Phase 5: Evidence Vault + Actions Tracker
- Goal: Evidence upload/management and action tracking (table + board)
- Deliverable: Both pages fully functional with mock data

### Phase 6: Safeguarding, Quality, Compliance Dashboards
- Goal: Three specialist dashboards with domain-specific KPIs and tables
- Deliverable: All three dashboards with realistic data

### Phase 7: Reports & Exports
- Goal: Prebuilt report views with export placeholders
- Deliverable: Reports page with filtering and export UI

### Phase 8: Supabase Integration
- Goal: Auth, DB schema, RLS policies, storage, edge functions
- Deliverable: Live data flowing through the platform
