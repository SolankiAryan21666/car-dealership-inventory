import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: string;
}

// Centralized here so the secret/expiry logic lives in exactly one place —
// if we ever change the JWT strategy, we only touch this file.
export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};
