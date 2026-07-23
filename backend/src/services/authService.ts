import bcrypt from "bcrypt";
import { User, IUser } from "../models/User";
import { AppError } from "../utils/AppError";
import { generateToken } from "../utils/generateToken";

interface RegisterInput {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const SALT_ROUNDS = 10;

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const { email, password } = input;

  // Fail fast on missing fields before touching the database at all
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("A user with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user: IUser = await User.create({
    email,
    passwordHash,
    role: "customer", // registration always creates a customer; admins are seeded/promoted separately
  });

  const token = generateToken({ userId: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};
