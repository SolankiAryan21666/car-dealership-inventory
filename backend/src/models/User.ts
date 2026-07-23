import { Schema, model, Document } from "mongoose";

// Roles are restricted to a fixed set so authorization checks stay predictable
export type UserRole = "admin" | "customer";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
