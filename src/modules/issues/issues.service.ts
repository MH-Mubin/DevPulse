import { pool } from "../../db";
import type {
  CreateIssuePayload,
  IssueDetail,
  IssueQuery,
  IssueRecord,
  UpdateIssuePayload,
} from "./issues.interface";

const createIssue = async (
  payload: CreateIssuePayload,
  reporterId: number,
): Promise<IssueRecord> => {
  const { title, description, type } = payload;

  const result = await pool.query(
    "INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING id, title, description, type, status, reporter_id, created_at, updated_at",
    [title, description, type, reporterId],
  );

  return result.rows[0] as IssueRecord;
};

const getAllIssues = async (query: IssueQuery) => {
  const { sort, status, type } = query;
  const values: string[] = [];
  let sql =
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues";

  if (type) {
    values.push(type);
    sql += ` WHERE type = $${values.length}`;
  }

  if (status) {
    values.push(status);
    sql += values.length === 1 ? " WHERE" : " AND";
    sql += ` status = $${values.length}`;
  }

  const sortOrder = sort === "oldest" ? "ASC" : "DESC";
  sql += ` ORDER BY created_at ${sortOrder}`;

  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows as IssueRecord[];

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = Array.from(new Set(issues.map((i) => i.reporter_id)));
  const idPlaceholders = reporterIds
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const reportersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id IN (${idPlaceholders})`,
    reporterIds,
  );

  const reporterById: Record<
    number,
    { id: number; name: string; role: string }
  > = {};
  for (const reporter of reportersResult.rows) {
    reporterById[reporter.id as number] = {
      id: reporter.id as number,
      name: reporter.name as string,
      role: reporter.role as string,
    };
  }

  return issues.map((issue) => {
    const reporter = reporterById[issue.reporter_id] ?? {
      id: issue.reporter_id,
      name: "Unknown",
      role: "contributor",
    };

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role as "contributor" | "maintainer",
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
  });
};

const getSingleIssue = async (id: string): Promise<IssueDetail | null> => {
  const issueResult = await pool.query(
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1",
    [id],
  );

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0] as IssueRecord;

  const reporterResult = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [issue.reporter_id],
  );

  const reporterRow = reporterResult.rows[0];
  const reporter = reporterRow
    ? {
        id: reporterRow.id as number,
        name: reporterRow.name as string,
        role: reporterRow.role as "contributor" | "maintainer",
      }
    : {
        id: issue.reporter_id,
        name: "Unknown",
        role: "contributor" as const,
      };

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const getIssueById = async (id: string): Promise<IssueRecord | null> => {
  const result = await pool.query(
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as IssueRecord;
};

const updateIssue = async (
  id: string,
  payload: UpdateIssuePayload,
): Promise<IssueRecord> => {
  const values: Array<string> = [];
  const fields: string[] = [];

  if (payload.title) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.type) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  fields.push(`updated_at = NOW()`);

  values.push(id);

  const result = await pool.query(
    `UPDATE issues SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values,
  );

  return result.rows[0] as IssueRecord;
};

export const issuesService = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  getIssueById,
  updateIssue,
};
