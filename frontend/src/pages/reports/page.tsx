import ComingSoon from '@/pages/ComingSoon';

export default function ReportsPage() {
  return (
    <ComingSoon
      title="Reports & Exports"
      icon="ri-file-chart-line"
      description="A powerful reporting suite with prebuilt and custom reports across all modules — exportable as CSV or PDF with print-friendly layouts."
      features={[
        'Prebuilt reports: learner, employer, safeguarding, quality, compliance',
        'Custom report builder with field and filter selection',
        'CSV and PDF export for all report types',
        'Scheduled report delivery via email',
        'Print-friendly layout optimised for Ofsted visits',
        'Saved report templates for frequent use',
      ]}
      eta="Phase 4 — Q2 2025"
    />
  );
}
