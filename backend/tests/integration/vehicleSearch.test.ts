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

const getAuthToken = async (): Promise<string> => {
  const response = await request(app).post("/api/auth/register").send({
    email: "searcher@example.com",
    password: "SecurePass123",
  });
  return response.body.token;
};

const seedVehicles = async (token: string) => {
  const vehicles = [
    { make: "Toyota", model: "Corolla", category: "Sedan", price: 22000, quantity: 5 },
    { make: "Toyota", model: "Camry", category: "Sedan", price: 28000, quantity: 3 },
    { make: "Honda", model: "CR-V", category: "SUV", price: 32000, quantity: 2 },
    { make: "Ford", model: "Mustang", category: "Coupe", price: 45000, quantity: 1 },
  ];

  for (const vehicle of vehicles) {
    await request(app).post("/api/vehicles").set("Authorization", `Bearer ${token}`).send(vehicle);
  }
};

describe("GET /api/vehicles/search", () => {
  it("rejects the request when no token is provided", async () => {
    const response = await request(app).get("/api/vehicles/search?make=Toyota");
    expect(response.status).toBe(401);
  });

  it("filters vehicles by make", async () => {
    const token = await getAuthToken();
    await seedVehicles(token);

    const response = await request(app)
      .get("/api/vehicles/search?make=Toyota")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body.every((v: any) => v.make === "Toyota")).toBe(true);
  });

  it("filters vehicles by category", async () => {
    const token = await getAuthToken();
    await seedVehicles(token);

    const response = await request(app)
      .get("/api/vehicles/search?category=SUV")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].model).toBe("CR-V");
  });

  it("filters vehicles by price range", async () => {
    const token = await getAuthToken();
    await seedVehicles(token);

    const response = await request(app)
      .get("/api/vehicles/search?minPrice=25000&maxPrice=35000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // Camry (28000) and CR-V (32000)
  });

  it("combines multiple filters together", async () => {
    const token = await getAuthToken();
    await seedVehicles(token);

    const response = await request(app)
      .get("/api/vehicles/search?make=Toyota&maxPrice=25000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].model).toBe("Corolla");
  });

  it("returns an empty array when no vehicles match", async () => {
    const token = await getAuthToken();
    await seedVehicles(token);

    const response = await request(app)
      .get("/api/vehicles/search?make=Tesla")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
