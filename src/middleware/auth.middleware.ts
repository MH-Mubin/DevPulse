import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import config from "../config/env";
import type { UserRole } from "../modules/auth/auth.interface";

type AuthUser = {
  id: number;
  name: string;
  role: UserRole;
};

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "Token missing",
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;

    (req as Request & { user: AuthUser }).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: "Invalid token",
    });
  }
};

export default auth;
