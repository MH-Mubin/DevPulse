import type {
  IssueQuery,
  IssueStatus,
  IssueType,
} from "../modules/issues/issues.interface";

type IssueInput = {
  title: string | undefined;
  description: string | undefined;
  type: string | undefined;
};

type QueryInput = {
  sort: string | undefined;
  type: string | undefined;
  status: string | undefined;
};

const isIssueType = (value?: string): value is IssueType => {
  return value === "bug" || value === "feature_request";
};

const isIssueStatus = (value?: string): value is IssueStatus => {
  return value === "open" || value === "in_progress" || value === "resolved";
};

const isSort = (value?: string): value is "newest" | "oldest" => {
  return value === "newest" || value === "oldest";
};

const validateIssueInput = (payload: IssueInput, requireAll: boolean) => {
  const { title, description, type } = payload;

  if (requireAll) {
    if (!title || !description || !type) {
      return {
        message: "Title, description, and type are required",
        errors: "Missing required fields",
      };
    }
  } else if (!title && !description && !type) {
    return {
      message: "Nothing to update",
      errors: "At least one field is required",
    };
  }

  if (title && title.length > 150) {
    return {
      message: "Title is too long",
      errors: "Title must be 150 characters or less",
    };
  }

  if (description && description.length < 20) {
    return {
      message: "Description is too short",
      errors: "Description must be at least 20 characters",
    };
  }

  if (type && !isIssueType(type)) {
    return {
      message: "Invalid type",
      errors: "Type must be bug or feature_request",
    };
  }

  return null;
};

const parseIssueQuery = (
  input: QueryInput,
): { query: IssueQuery } | { error: { message: string; errors: string } } => {
  const sortValue = input.sort ?? "newest";

  if (!isSort(sortValue)) {
    return {
      error: {
        message: "Invalid sort value",
        errors: "Sort must be newest or oldest",
      },
    };
  }

  if (input.type && !isIssueType(input.type)) {
    return {
      error: {
        message: "Invalid type",
        errors: "Type must be bug or feature_request",
      },
    };
  }

  if (input.status && !isIssueStatus(input.status)) {
    return {
      error: {
        message: "Invalid status",
        errors: "Status must be open, in_progress, or resolved",
      },
    };
  }

  const query: IssueQuery = { sort: sortValue };
  if (isIssueType(input.type)) query.type = input.type;
  if (isIssueStatus(input.status)) query.status = input.status;

  return { query };
};

export { isIssueStatus, isIssueType, parseIssueQuery, validateIssueInput };
