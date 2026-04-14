export const mockKPIs = {
  activeLearners: { value: 10, trend: '+2', status: 'Green' },
  avgAttendance: { value: 88.9, trend: '-1.2%', status: 'Amber' },
  otjhCompliance: { value: 71, trend: '-4%', status: 'Amber' },
  overdueReviews: { value: 4, trend: '+2', status: 'Red' },
  openActions: { value: 8, trend: '+3', status: 'Amber' },
  safeguardingAlerts: { value: 2, trend: '0', status: 'Amber' },
  ofstedReadiness: { value: 74, trend: '+6', status: 'Amber' },
  employerEngagement: { value: 76.8, trend: '+1.3', status: 'Green' },
};

export const mockAlerts = [
  { id: 'alr-001', type: 'Overdue Review', message: 'Marcus Reid - Progress review 6 weeks overdue', severity: 'Red', learner_id: 'lrn-002', created_at: '2024-11-20' },
  { id: 'alr-002', type: 'Overdue Review', message: 'Ryan Patel - Progress review 10 weeks overdue', severity: 'Red', learner_id: 'lrn-006', created_at: '2024-11-15' },
  { id: 'alr-003', type: 'Low OTJH', message: 'Ryan Patel - OTJH only 44% of target logged', severity: 'Red', learner_id: 'lrn-006', created_at: '2024-11-15' },
  { id: 'alr-004', type: 'Low Attendance', message: 'Ryan Patel - Attendance dropped to 65%', severity: 'Red', learner_id: 'lrn-006', created_at: '2024-11-14' },
  { id: 'alr-005', type: 'Missing Signature', message: 'Boots UK - 3 progress reviews unsigned', severity: 'Amber', employer_id: 'emp-005', created_at: '2024-11-18' },
  { id: 'alr-006', type: 'Low OTJH', message: 'Marcus Reid - OTJH at 72.5% of target', severity: 'Amber', learner_id: 'lrn-002', created_at: '2024-11-10' },
  { id: 'alr-007', type: 'Safeguarding', message: 'Open case requires weekly check-in', severity: 'Amber', created_at: '2024-11-22' },
];

export const mockAttendanceTrend = [
  { month: 'Jul', value: 91 },
  { month: 'Aug', value: 89 },
  { month: 'Sep', value: 93 },
  { month: 'Oct', value: 90 },
  { month: 'Nov', value: 87 },
  { month: 'Dec', value: 88 },
];

export const mockOTJHTrend = [
  { month: 'Jul', value: 79 },
  { month: 'Aug', value: 76 },
  { month: 'Sep', value: 78 },
  { month: 'Oct', value: 75 },
  { month: 'Nov', value: 72 },
  { month: 'Dec', value: 71 },
];

export const mockRagBreakdown = {
  green: 4,
  amber: 4,
  red: 2,
};

export const mockOfstedThemes = [
  { theme: 'Quality of Education', score: 78, evidence: 24, status: 'Amber' },
  { theme: 'Behaviours & Attitudes', score: 85, evidence: 18, status: 'Green' },
  { theme: 'Personal Development', score: 70, evidence: 12, status: 'Amber' },
  { theme: 'Leadership & Management', score: 82, evidence: 21, status: 'Green' },
  { theme: 'Safeguarding', score: 90, evidence: 31, status: 'Green' },
  { theme: 'Employer Engagement', score: 65, evidence: 14, status: 'Amber' },
];

export const mockSafeguardingCases = [
  {
    id: 'sg-001',
    learner: 'Confidential',
    severity: 'Medium',
    category: 'Mental Health',
    status: 'Active',
    assigned_to: 'Kevin Richards',
    opened_date: '2024-10-12',
    last_updated: '2024-11-25',
  },
  {
    id: 'sg-002',
    learner: 'Confidential',
    severity: 'Low',
    category: 'Financial Hardship',
    status: 'Monitoring',
    assigned_to: 'Kevin Richards',
    opened_date: '2024-11-05',
    last_updated: '2024-11-28',
  },
];
