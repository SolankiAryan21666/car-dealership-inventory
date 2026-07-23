import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app";
import { User } from "../../src/models/User";
import { Vehicle } from "../../src/models/Vehicle";
import { generateToken } from "../../src/utils/generateToken";
import { connectTestDb, closeTestDb, clearTestDb } from "../testDb";

beforeAll(async () => {
  await connectTestDb();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

const getCustomerToken = async (): Promise<string> => {
  const response = await request(app).post("/api/auth/register").send({
    email: "customer@example.com",
    password: "SecurePass123",
  });
  return response.body.token;
};

// Admins aren't created through public registration, so we seed one directly
// via the model — mirroring how a real app would seed/promote admin accounts.
const getAdminToken = async (): Promise<string> => {
  const passwordHash = await bcrypt.hash("AdminPass123", 10);
  const admin = await User.create({
    email: "admin@example.com",
    passwordHash,
    role: "admin",
  });
  return generateToken({ userId: admin.id, role: "admin" });
};

const createSampleVehicle = async (token: string) => {
  const response = await request(app)
    .post("/api/vehicles")
    .set("Authorization", `Bearer ${token}`)
    .send({ make: "Toyota", model: "Corolla", category: "Sedan", price: 22000, quantity: 5 });
  return response.body._id;
};

describe("PUT /api/vehicles/:id", () => {
  it("rejects the request when no token is provided", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createSampleVehicle(token);

    const response = await request(app).put(`/api/vehicles/${vehicleId}`).send({ price: 25000 });
    expect(response.status).toBe(401);
  });

  it("updates a vehicle when authenticated", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createSampleVehicle(token);

    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 25000, quantity: 8 });

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(25000);
    expect(response.body.quantity).toBe(8);
  });

  it("returns 404 when the vehicle does not exist", async () => {
    const token = await getCustomerToken();
    const fakeId = "64bfae3f2f8fb814b56fa181"; // valid ObjectId format, doesn't exist

    const response = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 25000 });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("rejects the request when no token is provided", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createSampleVehicle(token);

    const response = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(response.status).toBe(401);
  });

  it("rejects deletion by a non-admin user with 403", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createSampleVehicle(token);

    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("deletes a vehicle when the requester is an admin", async () => {
    const customerToken = await getCustomerToken();
    const vehicleId = await createSampleVehicle(customerToken);
    const adminToken = await getAdminToken();

    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const stillExists = await Vehicle.findById(vehicleId);
    expect(stillExists).toBeNull();
  });

  it("returns 404 when the vehicle does not exist", async () => {
    const adminToken = await getAdminToken();
    const fakeId = "64bfae3f2f8fb814b56fa181";

    const response = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});
