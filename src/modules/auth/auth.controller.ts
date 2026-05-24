import type { Request, Response } from "express";

import sendResponse from "../../utils/sendResponse";
import type { LoginPayload, SignupPayload } from "./auth.interface";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as SignupPayload;

    if (!name || !email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Name, email, and password are required",
        errors: "Missing required fields",
      });
    }

    if (role && role !== "contributor" && role !== "maintainer") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid role",
        errors: "Role must be contributor or maintainer",
      });
    }

    const payload: SignupPayload = role
      ? { name, email, password, role }
      : { name, email, password };

    const result = await authService.createUser(payload);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message,
      errors: error,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Email and password are required",
        errors: "Missing required fields",
      });
    }

    const result = await authService.loginUser({ email, password });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message,
      errors: error,
    });
  }
};

export const authController = {
  signup,
  login,
};
