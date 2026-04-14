import ComingSoon from '@/pages/ComingSoon';

export default function SafeguardingPage() {
  return (
    <ComingSoon
      title="Safeguarding Dashboard"
      icon="ri-heart-pulse-line"
      description="A privacy-sensitive safeguarding module for tracking open cases, severity levels, wellbeing interventions and case status — accessible to authorised roles only."
      features={[
        'Open case tracker with severity levels and status',
        'Confidential learner wellbeing records',
        'Intervention tracking and progress notes',
        'Category breakdown (mental health, financial, domestic)',
        'Role-based access — Safeguarding Lead and Director only',
        'Audit log of all case access and updates',
      ]}
      eta="Phase 3 — Q1 2025"
    />
  );
}
