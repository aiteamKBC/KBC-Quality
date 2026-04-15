import { api } from "./api";
import type { Learner } from "@/types/learners";

export async function fetchLearners(): Promise<Learner[]> {
  return api.get<Learner[]>("/learners/");
}

export async function fetchLearner(id: string): Promise<Learner> {
  return api.get<Learner>(`/learners/${encodeURIComponent(id)}/`);
}
