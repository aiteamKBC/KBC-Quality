import type { Learner } from "./learners";

export type DashboardTrendPoint = {
  month: string;
  label: string;
  value: number;
  target: number;
  review_rows?: number;
};

export type DashboardAlert = {
  id: string;
  type: string;
  message: string;
  severity: "Red" | "Amber";
  learner_id?: string;
  employer_id?: string;
  created_at: string;
};

export type DashboardProgrammePerformance = {
  name: string;
  attendance: number;
  otjh: number;
  learner_count: number;
};

export type DashboardOfstedTheme = {
  theme: string;
  score: number;
  evidence: number;
  status: "Green" | "Amber" | "Red";
};

export type DashboardRecentAction = {
  id: number;
  title: string;
  owner: string;
  status: string;
  priority: string;
  due_date: string;
};

export type DashboardSafeguardingSummary = {
  open_cases: number;
  active_interventions: number;
  resolved_this_month: number;
  wellbeing_referrals: number;
};

export type DashboardSafeguardingCase = {
  id: number;
  severity: string;
  category: string;
  status: string;
  assigned_to: string;
  last_updated: string;
};

export type DashboardCoachLearner = {
  id: string;
  full_name: string;
  programme: string;
  attendance_pct: number;
  otjh_pct: number;
  rag_status: "Green" | "Amber" | "Red";
  risk_flags: string[];
};

export type DashboardCoachAction = {
  id: number;
  title: string;
  priority: string;
  due_date: string;
};

export type DashboardCoachWorkload = {
  id: string;
  name: string;
  initials: string;
  total_learners: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  open_actions: number;
  critical_actions: number;
  overdue_reviews: number;
  next_review_due: string;
  avg_attendance: number;
  avg_otjh_pct: number;
  workload_score: number;
  learners: DashboardCoachLearner[];
  actions: DashboardCoachAction[];
};

export type DashboardSummary = {
  active_learners: number;
  avg_attendance: number;
  avg_progress: number;
  otjh_compliance_pct: number;
  overdue_reviews: number;
  open_actions: number;
  safeguarding_alerts: number;
  employer_engagement_pct: number;
  ofsted_readiness: number;
  rag_distribution: {
    Green: number;
    Amber: number;
    Red: number;
  };
};

export type DashboardOverview = {
  generated_at: string;
  summary: DashboardSummary;
  alerts: DashboardAlert[];
  attendance_trend: DashboardTrendPoint[];
  otjh_trend: DashboardTrendPoint[];
  programme_performance: DashboardProgrammePerformance[];
  ofsted_themes: DashboardOfstedTheme[];
  at_risk_learners: Learner[];
  recent_actions: DashboardRecentAction[];
  safeguarding_summary: DashboardSafeguardingSummary;
  safeguarding_cases: DashboardSafeguardingCase[];
  coach_workload: DashboardCoachWorkload[];
};
