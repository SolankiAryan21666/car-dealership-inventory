import request from "supertest";
import app from "../../src/app";
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

// Shared helper: registers a user and returns their auth token,
// since every vehicle route is protected and needs a Bearer token.
const getAuthToken = async (email = "buyer@example.com"): Promise<string> => {
  const response = await request(app).post("/api/auth/register").send({
    email,
    password: "SecurePass123",
  });
  return response.body.token;
};

const sampleVehicle = {
  make: "Toyota",
  model: "Corolla",
  category: "Sedan",
  price: 22000,
  quantity: 5,
};

describe("POST /api/vehicles", () => {
  it("rejects the request when no token is provided", async () => {
    const response = await request(app).post("/api/vehicles").send(sampleVehicle);
    expect(response.status).toBe(401);
  });

  it("creates a vehicle when a valid token is provided", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleVehicle);

    expect(response.status).toBe(201);
    expect(response.body.make).toBe("Toyota");
    expect(response.body.quantity).toBe(5);
    expect(response.body).toHaveProperty("_id");
  });

  it("rejects creation with missing required fields with 400", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send({ make: "Toyota" });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/vehicles", () => {
  it("rejects the request when no token is provided", async () => {
    const response = await request(app).get("/api/vehicles");
    expect(response.status).toBe(401);
  });

  it("returns the list of all vehicles when authenticated", async () => {
    const token = await getAuthToken();

    await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleVehicle);

    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].make).toBe("Toyota");
  });
});
