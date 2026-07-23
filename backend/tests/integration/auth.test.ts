import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models/User";
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

describe("POST /api/auth/register", () => {
  it("creates a new user and returns 201 with a token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "customer@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("customer@example.com");
    // Password hash must never be exposed in the API response
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("stores the password as a bcrypt hash, not plaintext", async () => {
    await request(app).post("/api/auth/register").send({
      email: "customer2@example.com",
      password: "SecurePass123",
    });

    const savedUser = await User.findOne({ email: "customer2@example.com" });
    expect(savedUser?.passwordHash).not.toBe("SecurePass123");
  });

  it("rejects registration with a duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "SecurePass123",
    });

    const response = await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "AnotherPass456",
    });

    expect(response.status).toBe(409);
  });

  it("rejects registration with missing fields with 400", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "incomplete@example.com",
    });

    expect(response.status).toBe(400);
  });
});
