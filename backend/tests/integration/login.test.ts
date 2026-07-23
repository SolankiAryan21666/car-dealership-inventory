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

describe("POST /api/auth/login", () => {
  const credentials = {
    email: "logintest@example.com",
    password: "SecurePass123",
  };

  // Register a user before each login test, since login needs an existing account
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(credentials);
  });

  it("logs in successfully with correct credentials and returns a token", async () => {
    const response = await request(app).post("/api/auth/login").send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe(credentials.email);
  });

  it("rejects login with incorrect password with 401", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: credentials.email,
      password: "WrongPassword999",
    });

    expect(response.status).toBe(401);
  });

  it("rejects login for a non-existent email with 401", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(401);
  });

  it("rejects login with missing fields with 400", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: credentials.email,
    });

    expect(response.status).toBe(400);
  });
});
