import type { Request, Response } from "express";

import type { LoginPayload, SignupPayload } from "./auth.interface";
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

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errors: "Missing required fields",
      });
    }

    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const authController = {
  signup,
  login,
};
