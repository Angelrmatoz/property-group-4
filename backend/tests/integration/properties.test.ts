import request from "supertest";
import app from "@/index";
import {
  createMockProperty,
  generateAuthToken,
  mockQueryBuilder,
} from "../helpers";

jest.mock("@/models/property", () => {
  const mockSave = jest.fn();
  const mockPropertyModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockSave,
    toObject: () => ({ ...data, _id: "507f1f77bcf86cd799439012" }),
  })) as any;

  mockPropertyModel.find = jest.fn();
  mockPropertyModel.findById = jest.fn();
  mockPropertyModel.findByIdAndUpdate = jest.fn();
  mockPropertyModel.findByIdAndDelete = jest.fn();
  mockPropertyModel.findOne = jest.fn();
  mockPropertyModel.exec = jest.fn();
  mockPropertyModel._mockSave = mockSave;

  return mockPropertyModel;
});

jest.mock("@/middleware/auth", () => {
  return jest.fn((_req: any, _res: any, next: any) => {
    const auth = _req.headers && _req.headers.authorization;
    if (!auth) {
      return next({ status: 401, message: "Unauthorized" });
    }
    (_req as any).user = { id: "507f1f77bcf86cd799439011", admin: false };
    next();
  });
});

jest.mock("@/config/cloudinary", () => ({
  uploadBufferToCloudinary: jest.fn(),
  deleteMultipleFromCloudinary: jest.fn(),
  extractPublicId: jest.fn(),
  deleteFromCloudinary: jest.fn(),
}));

const MockProperty = require("@/models/property");
const MockCloudinary = require("@/config/cloudinary");

describe("Properties endpoints", () => {
  const userToken = generateAuthToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/properties", () => {
    it("returns empty array when no properties", async () => {
      MockProperty.find.mockReturnValue(mockQueryBuilder([]));

      const res = await request(app).get("/api/properties");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns all properties as DTO array", async () => {
      const props = [
        createMockProperty({
          _id: "1",
          title: "Property 1",
          price: 100000,
        }),
        createMockProperty({
          _id: "2",
          title: "Property 2",
          price: 200000,
        }),
      ];
      MockProperty.find.mockReturnValue(mockQueryBuilder(props));

      const res = await request(app).get("/api/properties");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toBe("Property 1");
      expect(res.body[1].title).toBe("Property 2");
    });

    it("filters by type", async () => {
      MockProperty.find.mockReturnValue(mockQueryBuilder([]));

      await request(app).get("/api/properties?type=rent");

      expect(MockProperty.find).toHaveBeenCalledWith(
        expect.objectContaining({ type: "rent" }),
      );
    });

    it("filters by province", async () => {
      MockProperty.find.mockReturnValue(mockQueryBuilder([]));

      await request(app).get("/api/properties?province=Santo%20Domingo");

      expect(MockProperty.find).toHaveBeenCalledWith(
        expect.objectContaining({ province: "Santo Domingo" }),
      );
    });

    it("filters by price range", async () => {
      MockProperty.find.mockReturnValue(mockQueryBuilder([]));

      await request(app).get("/api/properties?minPrice=100000&maxPrice=500000");

      expect(MockProperty.find).toHaveBeenCalledWith(
        expect.objectContaining({
          price: { $gte: 100000, $lte: 500000 },
        }),
      );
    });

    it("applies pagination defaults", async () => {
      const queryBuilder = mockQueryBuilder([]);
      MockProperty.find.mockReturnValue(queryBuilder);

      await request(app).get("/api/properties");

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it("applies custom pagination", async () => {
      const queryBuilder = mockQueryBuilder([]);
      MockProperty.find.mockReturnValue(queryBuilder);

      await request(app).get("/api/properties?page=2&limit=10");

      expect(queryBuilder.skip).toHaveBeenCalledWith(20);
      expect(queryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });

  describe("GET /api/properties/:id", () => {
    it("returns property by id", async () => {
      const prop = createMockProperty();
      MockProperty.findById.mockReturnValue(mockQueryBuilder(prop));

      const res = await request(app).get(
        "/api/properties/507f1f77bcf86cd799439012",
      );

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Test Property");
    });

    it("returns 404 for non-existent property", async () => {
      MockProperty.findById.mockReturnValue(mockQueryBuilder(null));

      const res = await request(app).get(
        "/api/properties/507f1f77bcf86cd799439099",
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/properties", () => {
    it("creates property with valid data", async () => {
      MockProperty._mockSave.mockResolvedValue(undefined);
      MockProperty.mockImplementation((data: any) => ({
        ...data,
        _id: "new-id-123",
        save: MockProperty._mockSave,
        toObject: () => ({
          ...data,
          _id: "new-id-123",
          createdAt: new Date().toISOString(),
        }),
      }));

      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "New Property")
        .field("description", "A great property")
        .field("province", "Santo Domingo")
        .field("city", "Distrito Nacional")
        .field("neighborhood", "Zona Colonial")
        .field("type", "sale")
        .field("category", "apartment")
        .field("price", "250000")
        .field("bedrooms", "3")
        .field("bathrooms", "2")
        .field("halfBathrooms", "1")
        .field("parkingSpaces", "2")
        .field("builtArea", "150");

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Property");
    });

    it("returns 400 when required fields missing", async () => {
      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Incomplete");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Missing required field");
    });

    it("returns 400 when description exceeds 2000 chars", async () => {
      const longDesc = "x".repeat(2001);

      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Test")
        .field("description", longDesc)
        .field("province", "Santo Domingo")
        .field("city", "Distrito Nacional")
        .field("neighborhood", "Zona")
        .field("type", "sale")
        .field("category", "apartment")
        .field("price", "100000")
        .field("bedrooms", "2")
        .field("bathrooms", "1")
        .field("halfBathrooms", "0")
        .field("parkingSpaces", "1")
        .field("builtArea", "80");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("2,000 caracteres");
    });
  });

  describe("PUT /api/properties/:id", () => {
    it("updates property fields", async () => {
      const existingProp = createMockProperty();
      MockProperty.findById.mockReturnValue(mockQueryBuilder(existingProp));
      MockProperty.findByIdAndUpdate.mockReturnValue(
        mockQueryBuilder({
          ...existingProp,
          title: "Updated Title",
          price: 300000,
        }),
      );

      const res = await request(app)
        .put("/api/properties/507f1f77bcf86cd799439012")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Updated Title")
        .field("price", "300000");

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
    });

    it("returns 404 for non-existent property", async () => {
      MockProperty.findById.mockReturnValue(mockQueryBuilder(null));

      const res = await request(app)
        .put("/api/properties/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Whatever");

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/properties/:id", () => {
    it("deletes existing property", async () => {
      const prop = createMockProperty({ images: [] });
      MockProperty.findById.mockReturnValue(mockQueryBuilder(prop));
      MockProperty.findByIdAndDelete.mockReturnValue(mockQueryBuilder(prop));

      const res = await request(app)
        .delete("/api/properties/507f1f77bcf86cd799439012")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(204);
    });

    it("returns 404 for non-existent property", async () => {
      MockProperty.findById.mockReturnValue(mockQueryBuilder(null));

      const res = await request(app)
        .delete("/api/properties/507f1f77bcf86cd799439099")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DTO normalization", () => {
    it("normalizes type from 'venta' to 'sale'", async () => {
      MockProperty.find.mockReturnValue(mockQueryBuilder([]));

      await request(app).get("/api/properties?type=venta");

      expect(MockProperty.find).toHaveBeenCalledWith(
        expect.objectContaining({ type: "sale" }),
      );
    });

    it("accepts Spanish field names", async () => {
      MockProperty._mockSave.mockResolvedValue(undefined);
      MockProperty.mockImplementation((data: any) => ({
        ...data,
        _id: "new-id-456",
        save: MockProperty._mockSave,
        toObject: () => ({
          ...data,
          _id: "new-id-456",
          createdAt: new Date().toISOString(),
        }),
      }));

      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("titulo", "Casa en venta")
        .field("descripcion", "Hermosa casa")
        .field("provincia", "Santiago")
        .field("municipio", "Santiago")
        .field("sector", "Los Jardines")
        .field("tipo", "venta")
        .field("categoria", "house")
        .field("precio", "3500000")
        .field("habitaciones", "4")
        .field("banos", "3")
        .field("mediosBanos", "1")
        .field("parqueos", "2")
        .field("construccion", "200");

      expect(res.status).toBe(201);
    });
  });

  describe("Authentication required", () => {
    it("returns 401 on POST without token", async () => {
      const res = await request(app)
        .post("/api/properties")
        .field("title", "Some Property");

      expect(res.status).toBe(401);
    });

    it("returns 401 on PUT without token", async () => {
      const res = await request(app)
        .put("/api/properties/507f1f77bcf86cd799439012")
        .field("title", "Updated");

      expect(res.status).toBe(401);
    });

    it("returns 401 on DELETE without token", async () => {
      const res = await request(app).delete(
        "/api/properties/507f1f77bcf86cd799439012",
      );

      expect(res.status).toBe(401);
    });
  });

  describe("Error handling", () => {
    it("returns 500 when Cloudinary upload fails", async () => {
      MockCloudinary.uploadBufferToCloudinary.mockRejectedValue(
        new Error("Cloudinary error"),
      );
      MockProperty._mockSave.mockResolvedValue(undefined);
      MockProperty.mockImplementation((data: any) => ({
        ...data,
        _id: "new-id-789",
        save: MockProperty._mockSave,
        toObject: () => ({
          ...data,
          _id: "new-id-789",
          createdAt: new Date().toISOString(),
        }),
      }));

      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Property With Image")
        .field("description", "Description here")
        .field("province", "Santo Domingo")
        .field("city", "Distrito Nacional")
        .field("neighborhood", "Zona")
        .field("type", "sale")
        .field("category", "apartment")
        .field("price", "100000")
        .field("bedrooms", "2")
        .field("bathrooms", "1")
        .field("halfBathrooms", "0")
        .field("parkingSpaces", "1")
        .field("builtArea", "80")
        .attach("images", Buffer.from("fake-image"), {
          filename: "test.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(500);
    });

    it("returns 400 when image file type is invalid", async () => {
      const res = await request(app)
        .post("/api/properties")
        .set("Authorization", `Bearer ${userToken}`)
        .field("title", "Property")
        .field("description", "Description here")
        .field("province", "Santo Domingo")
        .field("city", "Distrito Nacional")
        .field("neighborhood", "Zona")
        .field("type", "sale")
        .field("category", "apartment")
        .field("price", "100000")
        .field("bedrooms", "2")
        .field("bathrooms", "1")
        .field("halfBathrooms", "0")
        .field("parkingSpaces", "1")
        .field("builtArea", "80")
        .attach("images", Buffer.from("fake-pdf"), {
          filename: "doc.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/tipo de archivo|imagen/i);
    });
  });
});
