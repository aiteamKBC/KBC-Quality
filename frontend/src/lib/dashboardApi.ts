import { api } from "./api";
import type { DashboardOverview } from "@/types/dashboard";

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return api.get<DashboardOverview>("/dashboard/overview/");
}
