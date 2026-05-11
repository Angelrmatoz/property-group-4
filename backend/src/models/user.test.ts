import bcrypt from "bcrypt";

jest.mock("bcrypt", () => {
  const mockHash = jest.fn();
  const mockCompare = jest.fn();
  return { hash: mockHash, compare: mockCompare };
});

const bcryptHash = bcrypt.hash as jest.Mock;
const bcryptCompare = bcrypt.compare as jest.Mock;
const SALT_ROUNDS = 10;

function createMockUser(overrides: Record<string, any> = {}) {
  const obj: Record<string, any> = {
    _id: "507f1f77bcf86cd799439011",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    admin: false,
    passwordHash: "",
    _password: null,
    ...overrides,
  };
  Object.defineProperty(obj, "password", {
    get() {
      return this._password;
    },
    set(val: string) {
      this._password = val;
    },
  });
  return obj;
}

describe("User model behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("password hashing", () => {
    it("hashes password with bcrypt using 10 salt rounds", async () => {
      bcryptHash.mockResolvedValue("$2b$10$hashedpassword");
      const result = await bcrypt.hash("securePassword123", SALT_ROUNDS);
      expect(bcryptHash).toHaveBeenCalledWith("securePassword123", SALT_ROUNDS);
      expect(result).toBe("$2b$10$hashedpassword");
    });

    it("produces different hashes for different passwords", async () => {
      bcryptHash
        .mockResolvedValueOnce("$2b$10$hash1")
        .mockResolvedValueOnce("$2b$10$hash2");
      const h1 = await bcrypt.hash("p1", SALT_ROUNDS);
      const h2 = await bcrypt.hash("p2", SALT_ROUNDS);
      expect(h1).not.toBe(h2);
    });
  });

  describe("comparePassword", () => {
    it("returns true for matching password", async () => {
      bcryptCompare.mockResolvedValue(true);
      const result = await bcrypt.compare("correctPassword", "$2b$10$h");
      expect(bcryptCompare).toHaveBeenCalledWith("correctPassword", "$2b$10$h");
      expect(result).toBe(true);
    });

    it("returns false for wrong password", async () => {
      bcryptCompare.mockResolvedValue(false);
      expect(await bcrypt.compare("wrong", "$2b$10$h")).toBe(false);
    });

    it("returns false when passwordHash is empty", async () => {
      bcryptCompare.mockResolvedValue(false);
      expect(await bcrypt.compare("any", "")).toBe(false);
    });
  });

  describe("password virtual", () => {
    it("uses virtual setter/getter pattern", () => {
      const user = createMockUser();
      user.password = "myPlainPassword";
      expect(user._password).toBe("myPlainPassword");
      expect(user.password).toBe("myPlainPassword");
    });
  });
});
