export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
}

export interface IssueRecord {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface ReporterInfo {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IssueListItem {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: ReporterInfo;
  created_at: string;
  updated_at: string;
}

export type IssueDetail = IssueListItem;

export interface IssueQuery {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}
