import ComingSoon from '@/pages/ComingSoon';

export default function CompliancePage() {
  return (
    <ComingSoon
      title="Compliance Dashboard"
      icon="ri-file-list-3-line"
      description="A compliance monitoring hub surfacing missing signatures, overdue documents, incomplete records and compliance risks — with cohort and programme breakdowns."
      features={[
        'Missing signature tracker across all learners and employers',
        'Overdue document alerts with escalation flags',
        'Incomplete record detection across all programmes',
        'Compliance risk scoring by cohort and programme',
        'Downloadable compliance summary reports',
        'Automated reminders and escalation workflows',
      ]}
      eta="Phase 3 — Q2 2025"
    />
  );
}
