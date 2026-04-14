import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/login/page";
import DashboardPage from "@/pages/dashboard/page";
import OfstedPage from "@/pages/ofsted/page";
import LearnersPage from "@/pages/learners/page";
import LearnerDetail from "@/pages/learners/LearnerDetail";
import EmployersPage from "@/pages/employers/page";
import EmployerDetail from "@/pages/employers/EmployerDetail";
import EvidencePage from "@/pages/evidence/page";
import ActionsPage from "@/pages/actions/page";
import SafeguardingPage from "@/pages/safeguarding/page";
import QualityPage from "@/pages/quality/page";
import CompliancePage from "@/pages/compliance/page";
import ReportsPage from "@/pages/reports/page";
import SettingsPage from "@/pages/settings/page";

const routes: RouteObject[] = [
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/ofsted", element: <OfstedPage /> },
  { path: "/learners", element: <LearnersPage /> },
  { path: "/learners/:id", element: <LearnerDetail /> },
  { path: "/employers", element: <EmployersPage /> },
  { path: "/employers/:id", element: <EmployerDetail /> },
  { path: "/evidence", element: <EvidencePage /> },
  { path: "/actions", element: <ActionsPage /> },
  { path: "/safeguarding", element: <SafeguardingPage /> },
  { path: "/quality", element: <QualityPage /> },
  { path: "/compliance", element: <CompliancePage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
