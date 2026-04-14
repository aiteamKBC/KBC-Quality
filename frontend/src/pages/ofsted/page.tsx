import ComingSoon from '@/pages/ComingSoon';

export default function OfstedPage() {
  return (
    <ComingSoon
      title="Ofsted Readiness"
      icon="ri-shield-star-line"
      description="A dedicated inspection readiness dashboard tracking evidence completeness by theme, strengths, gaps, and generating downloadable inspection packs."
      features={[
        'Overall readiness score with circular progress indicator',
        'Evidence completeness tracker by all 6 Ofsted themes',
        'Strengths, gaps and risk summary panel',
        'Curated evidence browser by inspection area',
        'One-click downloadable inspection evidence pack',
        'AI-generated readiness narrative for each theme',
      ]}
      eta="Phase 2 — Q1 2025"
    />
  );
}
