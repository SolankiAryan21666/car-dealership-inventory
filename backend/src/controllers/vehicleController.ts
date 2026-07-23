import { Request, Response } from "express";
import { createVehicle, getAllVehicles } from "../services/vehicleService";
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
