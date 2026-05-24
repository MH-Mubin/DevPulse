import type { Request, Response } from "express";

import type { UserRole } from "../auth/auth.interface";
import type {
  CreateIssuePayload,
  IssueQuery,
  UpdateIssuePayload,
} from "./issues.interface";
import { issuesService } from "./issues.service";

type AuthUser = {
  id: number;
  name: string;
  role: UserRole;
};

type AuthRequest = Request & { user: AuthUser };

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body as CreateIssuePayload;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and type are required",
        errors: "Missing required fields",
      });
    }

    if (title.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title is too long",
        errors: "Title must be 150 characters or less",
      });
    }

    if (description.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Description is too short",
        errors: "Description must be at least 20 characters",
      });
    }

    if (type !== "bug" && type !== "feature_request") {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
        errors: "Type must be bug or feature_request",
      });
    }

    const user = (req as AuthRequest).user;
    const result = await issuesService.createIssue(
      { title, description, type },
      user.id,
    );

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Issue create failed";

    return res.status(500).json({
      success: false,
      message,
      errors: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const sort = (req.query.sort as string | undefined) ?? "newest";
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    if (sort !== "newest" && sort !== "oldest") {
      return res.status(400).json({
        success: false,
        message: "Invalid sort value",
        errors: "Sort must be newest or oldest",
      });
    }

    if (type && type !== "bug" && type !== "feature_request") {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
        errors: "Type must be bug or feature_request",
      });
    }

    if (
      status &&
      status !== "open" &&
      status !== "in_progress" &&
      status !== "resolved"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        errors: "Status must be open, in_progress, or resolved",
      });
    }

    const query: IssueQuery = { sort };

    if (type === "bug" || type === "feature_request") {
      query.type = type;
    }

    if (status === "open" || status === "in_progress" || status === "resolved") {
      query.status = status;
    }

    const result = await issuesService.getAllIssues(query);

    return res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get issues";

    return res.status(500).json({
      success: false,
      message,
      errors: error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await issuesService.getSingleIssue(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        errors: "No issue found with this id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get issue";

    return res.status(500).json({
      success: false,
      message,
      errors: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, type } = req.body as UpdateIssuePayload;

    if (!title && !description && !type) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
        errors: "At least one field is required",
      });
    }

    if (title && title.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title is too long",
        errors: "Title must be 150 characters or less",
      });
    }

    if (description && description.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Description is too short",
        errors: "Description must be at least 20 characters",
      });
    }

    if (type && type !== "bug" && type !== "feature_request") {
      return res.status(400).json({
        success: false,
        message: "Invalid type",
        errors: "Type must be bug or feature_request",
      });
    }

    const user = (req as AuthRequest).user;
    const issue = await issuesService.getIssueById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        errors: "No issue found with this id",
      });
    }

    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You can only update your own issues",
        });
      }

      if (issue.status !== "open") {
        return res.status(409).json({
          success: false,
          message: "Issue cannot be updated",
          errors: "Only open issues can be updated by contributors",
        });
      }
    }

    const updatePayload: UpdateIssuePayload = {};
    if (title) updatePayload.title = title;
    if (description) updatePayload.description = description;
    if (type) updatePayload.type = type;

    const result = await issuesService.updateIssue(id, updatePayload);

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update issue";

    return res.status(500).json({
      success: false,
      message,
      errors: error,
    });
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
};
