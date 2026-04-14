import ComingSoon from '@/pages/ComingSoon';

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      icon="ri-settings-3-line"
      description="Platform configuration including user management, role-based access control, integration settings, notification preferences and full audit trail."
      features={[
        'User management — invite, edit and deactivate accounts',
        'Role-based access control for all 10 user roles',
        'Integration management — APTEM, M365, Zoho Forms, LMS',
        'Notification preferences and alert thresholds',
        'Audit log of all platform activity',
        'Data retention and security policy configuration',
      ]}
      eta="Phase 4 — Q2 2025"
    />
  );
}
