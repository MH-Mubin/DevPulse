import { pool } from "../../db";
import type { CreateIssuePayload, IssueQuery, IssueRecord } from "./issues.interface";

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
  const idPlaceholders = reporterIds.map((_, index) => `$${index + 1}`).join(", ");

  const reportersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id IN (${idPlaceholders})`,
    reporterIds,
  );

  const reporterById: Record<number, { id: number; name: string; role: string }> = {};
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

export const issuesService = {
  createIssue,
  getAllIssues,
};
