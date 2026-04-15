import { Pool } from "pg";

export type LearnerRecord = {
  id: string;
  full_name: string;
  email: string;
  programme: string;
  cohort: string;
  employer: string;
  employer_id: string;
  coach: string;
  coach_id: string;
  start_date: string;
  expected_end_date: string;
  attendance_pct: number;
  otjh_logged: number;
  otjh_target: number;
  rag_status: "Green" | "Amber" | "Red";
  risk_flags: string[];
  is_active: boolean;
  last_review: string;
  next_review: string;
  progress: number;
};

const TABLE_SCHEMA = "public";
const TABLE_NAME = "kbc_users_data";

let pool: Pool | null = null;
let cachedColumns: string[] | null = null;

function getPool() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing NEON_DATABASE_URL or DATABASE_URL.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=require") ? undefined : { rejectUnauthorized: false },
    });
  }

  return pool;
}

function quoteIdent(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function getColumns() {
  if (cachedColumns) {
    return cachedColumns;
  }

  const result = await getPool().query<{ column_name: string }>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `,
    [TABLE_SCHEMA, TABLE_NAME],
  );

  cachedColumns = result.rows.map((row) => row.column_name);
  return cachedColumns;
}

function findColumn(columns: string[], candidates: string[]) {
  const normalized = new Map(columns.map((column) => [column.toLowerCase(), column]));

  for (const candidate of candidates) {
    const match = normalized.get(candidate.toLowerCase());
    if (match) {
      return match;
    }
  }

  return null;
}

function getString(row: Record<string, unknown>, candidates: string[], fallback = "") {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(row: Record<string, unknown>, candidates: string[], fallback = 0) {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function getDateString(row: Record<string, unknown>, candidates: string[], fallback = "") {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (typeof value === "string" && value.trim()) {
      return value.slice(0, 10);
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
  }

  return fallback;
}

function deriveRag(progress: number, attendancePct: number) {
  if (attendancePct < 80 || progress < 50) {
    return "Red" as const;
  }
  if (attendancePct < 90 || progress < 75) {
    return "Amber" as const;
  }
  return "Green" as const;
}

function buildRiskFlags(progress: number, attendancePct: number, otjhLogged: number, otjhTarget: number) {
  const flags: string[] = [];

  if (attendancePct < 90) {
    flags.push("Low Attendance");
  }
  if (otjhTarget > 0 && otjhLogged < otjhTarget * 0.75) {
    flags.push("Low OTJH");
  }
  if (progress < 50) {
    flags.push("Low Progress");
  }

  return flags;
}

function formatCohort(startDate: string) {
  if (!startDate) {
    return "Unknown";
  }

  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-GB", { month: "short", year: "numeric" });
}

function normalizeLearner(row: Record<string, unknown>, columns: string[]): LearnerRecord {
  const fullName = getString(row, ["FullName", "full_name", "fullname", "name"], "Unknown Learner");
  const email = getString(row, ["Email", "email"], "No email");
  const planned = getNumber(row, ["Planned", "planned"], 0);
  const completed = getNumber(row, ["Completed", "completed"], 0);
  const forecast = getNumber(row, ["Forecast", "forecast"], 0);
  const submitted = getNumber(row, ["Submitted", "submitted"], 0);
  const minimum = getNumber(row, ["Minimum", "minimum"], 0);
  const startDate = getDateString(row, ["StartDate", "start_date", "startdate"], "");
  const expectedEndDate = getDateString(row, ["ExpectedEndDate", "expected_end_date", "planned_end_date"], "");
  const lastReview = getDateString(row, ["LastReview", "last_review"], "");
  const nextReview = getDateString(row, ["NextReview", "next_review"], "");
  const attendancePct = forecast > 0
    ? Math.max(0, Math.min(100, Math.round((completed / forecast) * 100)))
    : Math.max(0, Math.min(100, minimum));
  const progress = planned > 0
    ? Math.max(0, Math.min(100, Math.round((completed / planned) * 100)))
    : Math.max(0, Math.min(100, submitted));
  const otjhTarget = planned || forecast || minimum || 1;
  const otjhLogged = completed || submitted;
  const ragStatus = deriveRag(progress, attendancePct);
  const riskFlags = buildRiskFlags(progress, attendancePct, otjhLogged, otjhTarget);
  const idValue = getString(row, ["ID", "id", "row_number"], fullName);

  return {
    id: idValue,
    full_name: fullName,
    email,
    programme: getString(row, ["Programme", "programme", "Course", "course"], "Programme not set"),
    cohort: getString(row, ["Cohort", "cohort"], formatCohort(startDate)),
    employer: getString(row, ["Employer", "employer", "EmployerName", "employer_name"], "Employer not set"),
    employer_id: getString(row, ["EmployerID", "employer_id"], ""),
    coach: getString(row, ["Coach", "coach", "Tutor", "tutor", "Assessor", "assessor"], "Unassigned"),
    coach_id: getString(row, ["CoachID", "coach_id"], ""),
    start_date: startDate,
    expected_end_date: expectedEndDate,
    attendance_pct: attendancePct,
    otjh_logged: otjhLogged,
    otjh_target: otjhTarget,
    rag_status: ragStatus,
    risk_flags: riskFlags,
    is_active: getString(row, ["Status", "status"], "active").toLowerCase() !== "inactive",
    last_review: lastReview,
    next_review: nextReview,
    progress,
  };
}

async function queryRows(whereClause?: string, params: string[] = []) {
  const columns = await getColumns();
  const poolInstance = getPool();
  const result = await poolInstance.query<{ row: Record<string, unknown> }>(
    `
      SELECT to_jsonb(src) AS row
      FROM (
        SELECT *
        FROM ${quoteIdent(TABLE_SCHEMA)}.${quoteIdent(TABLE_NAME)}
        ${whereClause ? `WHERE ${whereClause}` : ""}
        ORDER BY ${quoteIdent(findColumn(columns, ["FullName", "full_name", "fullname", "ID", "id"]) || columns[0] || "1")} ASC
        LIMIT 500
      ) AS src
    `,
    params,
  );

  return {
    columns,
    rows: result.rows.map((entry) => entry.row),
  };
}

export async function listLearners() {
  const { columns, rows } = await queryRows();
  return rows.map((row) => normalizeLearner(row, columns));
}

export async function getLearnerById(id: string) {
  const columns = await getColumns();
  const idColumn = findColumn(columns, ["ID", "id", "row_number"]);

  if (!idColumn) {
    const learners = await listLearners();
    return learners.find((learner) => learner.id === id) || null;
  }

  const { rows } = await queryRows(`${quoteIdent(idColumn)}::text = $1`, [id]);
  const row = rows[0];

  if (!row) {
    return null;
  }

  return normalizeLearner(row, columns);
}

