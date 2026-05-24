import bcrypt from "bcrypt";
import { pool } from "../../db";
import type { AuthUser, SignupPayload, UserRole } from "./auth.interface";

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

export const authService = {
  createUser,
};
