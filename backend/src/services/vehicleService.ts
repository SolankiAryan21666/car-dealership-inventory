import { Vehicle, IVehicle } from "../models/Vehicle";
import { AppError } from "../utils/AppError";

interface CreateVehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export const createVehicle = async (input: CreateVehicleInput) => {
  const { make, model, category, price, quantity } = input;

  // Explicit presence check rather than relying only on Mongoose's schema
  // validation, so we control the exact 400 response shape returned to the client.
  if (!make || !model || !category || price === undefined || quantity === undefined) {
    throw new AppError("make, model, category, price, and quantity are all required", 400);
  }

  const vehicle = await Vehicle.create({ make, model, category, price, quantity });
  return vehicle;
};

export const getAllVehicles = async (): Promise<IVehicle[]> => {
  return Vehicle.find().sort({ createdAt: -1 });
};
