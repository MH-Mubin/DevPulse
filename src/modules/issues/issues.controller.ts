import type { Request, Response } from "express";

import { parseIssueQuery, validateIssueInput } from "../../utils/issueHelpers";
import sendResponse from "../../utils/sendResponse";
import type { UserRole } from "../auth/auth.interface";
import type {
  CreateIssuePayload,
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

    const errorResult = validateIssueInput({ title, description, type }, true);

    if (errorResult) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errorResult.message,
        errors: errorResult.errors,
      });
    }

    const user = (req as AuthRequest).user;
    const result = await issuesService.createIssue(
      { title, description, type },
      user.id,
    );

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Issue create failed";

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message,
      errors: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const parsed = parseIssueQuery({
      sort: req.query.sort as string | undefined,
      type: req.query.type as string | undefined,
      status: req.query.status as string | undefined,
    });

    if ("error" in parsed) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: parsed.error.message,
        errors: parsed.error.errors,
      });
    }

    const result = await issuesService.getAllIssues(parsed.query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrived successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get issues";

    return sendResponse(res, {
      statusCode: 500,
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
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "No issue found with this id",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrived successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get issue";

    return sendResponse(res, {
      statusCode: 500,
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

    const errorResult = validateIssueInput({ title, description, type }, false);

    if (errorResult) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errorResult.message,
        errors: errorResult.errors,
      });
    }

    const user = (req as AuthRequest).user;
    const issue = await issuesService.getIssueById(id);

    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "No issue found with this id",
      });
    }

    if (user.role === "contributor") {
      if (issue.reporter_id !== user.id) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden",
          errors: "You can only update your own issues",
        });
      }

      if (issue.status !== "open") {
        return sendResponse(res, {
          statusCode: 409,
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

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update issue";

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message,
      errors: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = (req as AuthRequest).user;

    if (user.role !== "maintainer") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        errors: "Only maintainers can delete issues",
      });
    }

    const issue = await issuesService.getIssueById(id);

    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "No issue found with this id",
      });
    }

    await issuesService.deleteIssue(id);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete issue";

    return sendResponse(res, {
      statusCode: 500,
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
  deleteIssue,
};
