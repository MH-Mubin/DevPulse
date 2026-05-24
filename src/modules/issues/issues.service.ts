import { pool } from "../../db";
import type { CreateIssuePayload, IssueRecord } from "./issues.interface";

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

export const issuesService = {
  createIssue,
};
