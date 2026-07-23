import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extending Express's Request type so req.user is recognized by TypeScript
// everywhere downstream (controllers can safely read req.user after this runs).
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; role: string };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthenticatedRequest).user;

  if (user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }

  next();
};
