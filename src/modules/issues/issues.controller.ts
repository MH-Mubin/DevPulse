import type { Request, Response } from "express";

import type { UserRole } from "../auth/auth.interface";
import type { CreateIssuePayload } from "./issues.interface";
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

export const issuesController = {
  createIssue,
};
