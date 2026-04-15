import { api } from "./api";
import type { Employer } from "@/types/employers";

export async function fetchEmployers(): Promise<Employer[]> {
  return api.get<Employer[]>("/employers/");
}

export async function fetchEmployer(id: string): Promise<Employer> {
  return api.get<Employer>(`/employers/${encodeURIComponent(id)}/`);
}
