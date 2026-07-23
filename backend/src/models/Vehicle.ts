import { Schema, model } from "mongoose";

export interface IVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

// No need to extend or intersect Document here — modern Mongoose (7/8) infers
// the hydrated document type automatically from the plain interface passed to
// Schema<T> and model<T>(). This also sidesteps the earlier collision between
// our `model` field and Document's built-in `.model` property entirely.
const vehicleSchema = new Schema<IVehicle>(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
