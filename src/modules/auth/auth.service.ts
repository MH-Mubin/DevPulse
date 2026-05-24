import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import config from "../../config/env";
import { pool } from "../../db";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  SignupPayload,
  UserRole,
} from "./auth.interface";

const createUser = async (payload: SignupPayload): Promise<AuthUser> => {
  const { name, email, password } = payload;
  const role: UserRole = payload.role ?? "contributor";

  const exist = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);

  if (exist.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at",
    [name, email, hashPassword, role],
  );

  return result.rows[0] as AuthUser;
};

const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { email, password } = payload;

  const result = await pool.query(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1",
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }

  const user = result.rows[0] as AuthUser & { password: string };
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid Credentials");
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: "1d" },
  );

  const { password: _password, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

export const authService = {
  createUser,
  loginUser,
};
