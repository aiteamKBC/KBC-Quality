export type ReviewEntry = {
  type: string;          // e.g. "Progress Review", "Personal Support Plan"
  planned_date: string;  // ISO yyyy-mm-dd
  actual_date: string;   // ISO yyyy-mm-dd or ""
  status: "Completed" | "Not Started";
};

export type AttendanceHistoryPoint = {
  month: string;
  label: string;
  attended: number;
  missed: number;
  total: number;
  attendance_pct: number;
};

export type AttendanceSession = {
  date: string;
  attendance: number;
  module: string;
  activity_pct: number | null;
};

export type LearnerTimelineEvent = {
  id: string;
  date: string;
  type: "Review" | "Attendance" | "Start" | "Alert";
  title: string;
  text: string;
  by: string;
};

export type Learner = {
  id: string;
  full_name: string;
  email: string;
  programme: string;
  cohort: string;
  // Employer — company name is `employer`, contact person is `employer_contact`
  employer: string;
  employer_email: string;
  employer_contact: string;
  employer_id: string;
  // Coach
  coach: string;
  coach_email: string;
  coach_id: string;
  // Dates
  start_date: string;
  expected_end_date: string;
  // Metrics
  attendance_pct: number;
  sessions_total: number;
  sessions_attended: number;
  sessions_missed: number;
  otjh_logged: number;
  otjh_target: number;
  rag_status: "Green" | "Amber" | "Red";
  risk_flags: string[];
  is_active: boolean;
  last_review: string;
  next_review: string;
  // Progress = CompletedComp% (programme/assignment completion, NOT OTJH or LMS)
  progress: number;
  // KPI counts (from TotalCompCount / CompletedCompCount / TargetCompCount)
  total_comp_count: number;
  completed_comp_count: number;
  target_comp_count: number;
  // KSB counts
  total_target_ksb: number;
  total_completed_ksb: number;
  // Structured reviews list (parsed from Review Planned Date1..16 / Review Status1..16)
  reviews: ReviewEntry[];
  attendance_history?: AttendanceHistoryPoint[];
  recent_sessions?: AttendanceSession[];
  summary_text?: string;
  timeline?: LearnerTimelineEvent[];
};
