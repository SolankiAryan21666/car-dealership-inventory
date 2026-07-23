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

interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export const searchVehicles = async (filters: SearchFilters): Promise<IVehicle[]> => {
  const query: Record<string, unknown> = {};

  // Case-insensitive exact match on text fields, since "toyota" and "Toyota"
  // should return the same results for a customer typing casually.
  if (filters.make) query.make = new RegExp(`^${filters.make}$`, "i");
  if (filters.model) query.model = new RegExp(`^${filters.model}$`, "i");
  if (filters.category) query.category = new RegExp(`^${filters.category}$`, "i");

  if (filters.minPrice || filters.maxPrice) {
    const priceRange: Record<string, number> = {};
    if (filters.minPrice) priceRange.$gte = Number(filters.minPrice);
    if (filters.maxPrice) priceRange.$lte = Number(filters.maxPrice);
    query.price = priceRange;
  }

  return Vehicle.find(query).sort({ createdAt: -1 });
};

interface UpdateVehicleInput {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export const updateVehicle = async (id: string, updates: UpdateVehicleInput) => {
  const vehicle = await Vehicle.findByIdAndUpdate(id, updates, {
    new: true, // return the document AFTER the update, not before
    runValidators: true, // re-apply schema validation (e.g. min price) on update
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  return vehicle;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const vehicle = await Vehicle.findByIdAndDelete(id);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
};
