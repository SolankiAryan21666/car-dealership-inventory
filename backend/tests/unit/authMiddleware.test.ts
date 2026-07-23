import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { protect, adminOnly } from "../../src/middleware/authMiddleware";

// Middleware doesn't touch the database, so we mock req/res/next directly —
// faster than spinning up supertest + MongoDB for logic this isolated.
const mockRequest = (headers: Record<string, string> = {}, user?: any) =>
  ({ headers, user } as unknown as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

beforeEach(() => {
  process.env.JWT_SECRET = "test_secret";
  jest.clearAllMocks();
});

describe("protect middleware", () => {
  it("calls next() and attaches user when token is valid", () => {
    const token = jwt.sign({ userId: "abc123", role: "customer" }, "test_secret");
    const req = mockRequest({ authorization: `Bearer ${token}` });
    const res = mockResponse();

    protect(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((req as any).user.userId).toBe("abc123");
  });

  it("returns 401 when no authorization header is present", () => {
    const req = mockRequest({});
    const res = mockResponse();

    protect(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid or malformed", () => {
    const req = mockRequest({ authorization: "Bearer not_a_real_token" });
    const res = mockResponse();

    protect(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe("adminOnly middleware", () => {
  it("calls next() when user role is admin", () => {
    const req = mockRequest({}, { userId: "abc123", role: "admin" });
    const res = mockResponse();

    adminOnly(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("returns 403 when user role is not admin", () => {
    const req = mockRequest({}, { userId: "abc123", role: "customer" });
    const res = mockResponse();

    adminOnly(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
