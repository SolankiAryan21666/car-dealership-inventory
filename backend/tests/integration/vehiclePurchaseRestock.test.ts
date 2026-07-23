import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app";
import { User } from "../../src/models/User";
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
    email: "buyer@example.com",
    password: "SecurePass123",
  });
  return response.body.token;
};

const getAdminToken = async (): Promise<string> => {
  const passwordHash = await bcrypt.hash("AdminPass123", 10);
  const admin = await User.create({ email: "admin2@example.com", passwordHash, role: "admin" });
  return generateToken({ userId: admin.id, role: "admin" });
};

const createVehicleWithQuantity = async (token: string, quantity: number) => {
  const response = await request(app)
    .post("/api/vehicles")
    .set("Authorization", `Bearer ${token}`)
    .send({ make: "Honda", model: "Civic", category: "Sedan", price: 24000, quantity });
  return response.body._id;
};

describe("POST /api/vehicles/:id/purchase", () => {
  it("rejects the request when no token is provided", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(token, 5);

    const response = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
    expect(response.status).toBe(401);
  });

  it("decreases quantity by 1 on a successful purchase", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(token, 5);

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(4);
  });

  it("rejects the purchase with 400 when quantity is already 0", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(token, 0);

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("returns 404 when the vehicle does not exist", async () => {
    const token = await getCustomerToken();
    const fakeId = "64bfae3f2f8fb814b56fa181";

    const response = await request(app)
      .post(`/api/vehicles/${fakeId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe("POST /api/vehicles/:id/restock", () => {
  it("rejects the request when no token is provided", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(token, 5);

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .send({ quantity: 10 });
    expect(response.status).toBe(401);
  });

  it("rejects restock by a non-admin user with 403", async () => {
    const token = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(token, 5);

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(403);
  });

  it("increases quantity when the requester is an admin", async () => {
    const customerToken = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(customerToken, 5);
    const adminToken = await getAdminToken();

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(200);
    expect(response.body.quantity).toBe(15);
  });

  it("rejects restock with 400 when quantity is missing or not positive", async () => {
    const customerToken = await getCustomerToken();
    const vehicleId = await createVehicleWithQuantity(customerToken, 5);
    const adminToken = await getAdminToken();

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: -3 });

    expect(response.status).toBe(400);
  });

  it("returns 404 when the vehicle does not exist", async () => {
    const adminToken = await getAdminToken();
    const fakeId = "64bfae3f2f8fb814b56fa181";

    const response = await request(app)
      .post(`/api/vehicles/${fakeId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(response.status).toBe(404);
  });
});
