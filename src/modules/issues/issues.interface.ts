export type IssueType = "bug" | "feature_request";

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
}

export interface IssueRecord {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}
