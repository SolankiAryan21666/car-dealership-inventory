import { Request, Response } from "express";
import {
  createVehicle,
  getAllVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleService";
import { AppError } from "../utils/AppError";

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, category, price, quantity } = req.body;
    const vehicle = await createVehicle({ make, model, category, price, quantity });
    res.status(201).json(vehicle);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await getAllVehicles();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicle = await updateVehicle(req.params.id, req.body);
    res.status(200).json(vehicle);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await deleteVehicle(req.params.id);
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const vehicles = await searchVehicles({
      make: make as string,
      model: model as string,
      category: category as string,
      minPrice: minPrice as string,
      maxPrice: maxPrice as string,
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
