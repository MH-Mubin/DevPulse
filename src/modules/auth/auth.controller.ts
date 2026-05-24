import type { Request, Response } from "express";

import type { SignupPayload } from "./auth.interface";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as SignupPayload;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
        errors: "Missing required fields",
      });
    }

    if (role && role !== "contributor" && role !== "maintainer") {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
        errors: "Role must be contributor or maintainer",
      });
    }

    const payload: SignupPayload = role
      ? { name, email, password, role }
      : { name, email, password };

    const result = await authService.createUser(payload);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const authController = {
  signup,
};
