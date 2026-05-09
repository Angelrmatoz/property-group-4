import jwt from "jsonwebtoken";

export const TEST_JWT_SECRET = "test-jwt-secret-for-testing-only";
export const TEST_USER_ID = "507f1f77bcf86cd799439011";
export const TEST_ADMIN_ID = "507f1f77bcf86cd799439099";

export interface MockUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  admin: boolean;
  passwordHash?: string;
  [key: string]: any;
}

export function createMockUser(
  overrides: Partial<MockUser> = {},
): MockUser {
  return {
    _id: TEST_USER_ID,
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    admin: false,
    passwordHash: "$2b$10$fakehash",
    ...overrides,
  };
}

export function createMockAdmin(
  overrides: Partial<MockUser> = {},
): MockUser {
  return createMockUser({
    _id: TEST_ADMIN_ID,
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    admin: true,
    ...overrides,
  });
}

export function createMockProperty(overrides: Record<string, any> = {}) {
  return {
    _id: "507f1f77bcf86cd799439012",
    title: "Test Property",
    description: "A test property description",
    price: 150000,
    currency: "USD",
    province: "Santo Domingo",
    city: "Distrito Nacional",
    neighborhood: "Ensanche Ozama",
    type: "sale",
    category: "apartment",
    bedrooms: 3,
    bathrooms: 2,
    halfBathrooms: 1,
    parkingSpaces: 2,
    builtArea: 120,
    images: [],
    furnished: "no",
    createdBy: TEST_USER_ID,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function generateAuthToken(
  userId = TEST_USER_ID,
  email = "test@example.com",
): string {
  return jwt.sign({ id: userId, email }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function mockQueryBuilder(result: any) {
  return {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  };
}
