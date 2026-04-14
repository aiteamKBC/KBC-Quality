import ComingSoon from '@/pages/ComingSoon';

export default function QualityPage() {
  return (
    <ComingSoon
      title="Quality Dashboard"
      icon="ri-bar-chart-grouped-line"
      description="A comprehensive quality performance dashboard tracking attendance trends, learner engagement, progress review completion, OTJH performance and coach analytics."
      features={[
        'Attendance and engagement trend charts',
        'Progress review completion rates by coach and programme',
        'OTJH performance breakdown and forecasting',
        'Coach performance league table with RAG status',
        'Programme and cohort comparison views',
        'Flagged quality concerns and improvement actions',
      ]}
      eta="Phase 3 — Q2 2025"
    />
  );
}
