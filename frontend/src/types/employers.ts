import type { Learner } from "./learners";

export type EmployerAction = {
  id: number;
  title: string;
  priority: string;
  status: string;
  due_date: string;
  owner: string;
  category: string;
};

export type EmployerRecentActivity = {
  learner_id: string;
  learner_name: string;
  date: string;
  module: string;
  attendance: number | null;
};

export type EmployerTimelineEvent = {
  id: string;
  date: string;
  type: "Review" | "Attendance";
  title: string;
  text: string;
};

export type Employer = {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  primary_programme: string;
  programme_count: number;
  learner_count: number;
  engagement_score: number;
  rag_status: "Green" | "Amber" | "Red";
  concerns: number;
  avg_attendance: number;
  avg_progress: number;
  avg_otjh_pct: number;
  latest_activity: string;
  reviews_due: number;
  linked_actions_count: number;
  summary_text: string;
  learners?: Learner[];
  actions?: EmployerAction[];
  recent_activity?: EmployerRecentActivity[];
  timeline?: EmployerTimelineEvent[];
};
