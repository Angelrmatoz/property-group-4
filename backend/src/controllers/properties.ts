import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import Property from "@/models/property";
import authenticate from "@/middleware/auth";
import { uploadBufferToCloudinary } from "@/utils/cloudinary";
import { PropertyDTO } from "@/dto/property";

const propertiesRouter = express.Router();

// configuración de multer -> usar memoria para enviar buffer a Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/png"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5 MB, max 10 files
});

function firstDefined<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (
      obj &&
      Object.prototype.hasOwnProperty.call(obj, k) &&
      obj[k] !== undefined &&
      obj[k] !== ""
    )
      return obj[k];
  }
  return undefined;
}

function _toNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

// Normaliza una clave: lower + remover diacríticos (acentos)
function normalizeKey(k: string): string {
  return k
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function getNumericFromBodyFlexible(
  obj: any,
  targetNames: string[]
): number | undefined {
  if (!obj) return undefined;
  // construir mapa de keys normalizadas a valor
  const map: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const nk = normalizeKey(key);
    map[nk] = obj[key];
  }

  for (const t of targetNames) {
    const nt = normalizeKey(t);
    if (nt in map) {
      let v = map[nt];
      if (Array.isArray(v)) v = v[0];
      if (typeof v === "string") {
        v = v.trim().replace(/,/g, ".");
      }
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  // fallback: try to parse any key that matches numerically after normalization
  for (const nk of Object.keys(map)) {
    for (const t of targetNames) {
      if (nk === normalizeKey(t)) continue; // already tried
    }
  }
  return undefined;
}

// Parse a flexible boolean from form values: supports true/false, 1/0, si/no, on/off
function parseBoolean(val: any): boolean | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  const s = String(val).trim().toLowerCase();
  if (["1", "true", "si", "sí", "on", "yes"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return undefined;
}

// GET / - lista de propiedades con filtros simples
propertiesRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, province, minPrice, maxPrice, limit, page } =
        req.query as any;

      const filter: any = {};
      if (type) filter.type = type;
      if (province) filter.province = province;
      if (minPrice || maxPrice) {
        filter.price = {} as any;
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const lim = Math.max(1, Number(limit) || 20);
      const pg = Math.max(0, Number(page) || 0);

      const items = await Property.find(filter)
        .skip(pg * lim)
        .limit(lim)
        .exec();
      // map to DTOs
      const out = items.map((it: any) => toDTO(it));
      res.json(out);
    } catch (err) {
      next(err as any);
    }
  }
);

// GET /:id - obtener una propiedad por id
propertiesRouter.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const item = await Property.findById(id).exec();
      if (!item) {
        const e: any = new Error("Property not found");
        e.status = 404;
        return next(e);
      }
      res.json(toDTO(item));
    } catch (err) {
      next(err as any);
    }
  }
);

// POST / - crear una nueva propiedad (acepta multipart/form-data con campo 'images' hasta 10 archivos)
propertiesRouter.post(
  "/",
  authenticate,
  // accept up to 10 images with the field name 'images'
  upload.array("images", 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as any;

      // if there are files, upload each to Cloudinary and collect URLs
      const imagesPaths: string[] = [];
      const files = (req as any).files as
        | (Express.Multer.File & { buffer?: Buffer })[]
        | undefined;

      if (files && files.length) {
        for (const file of files.slice(0, 10)) {
          if (!file.buffer) continue;
          try {
            const result = await uploadBufferToCloudinary(
              file.buffer,
              "properties"
            );
            const url = result?.secure_url || result?.url;
            if (url) imagesPaths.push(url);
          } catch (e) {
            return next(e as any);
          }
        }
      }

      // Normalizar campos que pueden venir con o sin tildes
      const bedrooms = getNumericFromBodyFlexible(body, [
        "bedrooms",
        "habitaciones",
      ]);
      const bathrooms = getNumericFromBodyFlexible(body, [
        "bathrooms",
        "banos",
        "baños",
      ]);
      const halfBathrooms = getNumericFromBodyFlexible(body, [
        "halfBathrooms",
        "mediosBanos",
        "mediosBaños",
      ]);
      const parkingSpaces = getNumericFromBodyFlexible(body, [
        "parkingSpaces",
        "parqueos",
      ]);
      const builtArea = getNumericFromBodyFlexible(body, [
        "builtArea",
        "construccion",
      ]);
      const price = getNumericFromBodyFlexible(body, ["price", "precio"]);

      // Validaciones básicas
      const requiredStringFields = [
        "title",
        "description",
        "province",
        "city",
        "neighborhood",
        "type",
      ];
      for (const f of requiredStringFields) {
        if (!firstDefined(body, [f])) {
          return res
            .status(400)
            .json({ error: `Missing required field: ${f}` });
        }
      }

      const missingNums: string[] = [];
      if (price === undefined) missingNums.push("price");
      if (bedrooms === undefined) missingNums.push("bedrooms");
      if (bathrooms === undefined) missingNums.push("bathrooms");
      if (halfBathrooms === undefined) missingNums.push("halfBathrooms");
      if (parkingSpaces === undefined) missingNums.push("parkingSpaces");
      if (builtArea === undefined) missingNums.push("builtArea");
      if (missingNums.length) {
        return res.status(400).json({
          error: `Numeric fields missing or invalid: ${missingNums.join(", ")}`,
        });
      }

      const userId = (req as any).user && (req as any).user.id;

      // parseamos un campo 'amueblado' opcional (puede venir como checkbox o texto)
      const rawFurnished = firstDefined(body, [
        "furnished",
        "amueblado",
        "mueblado",
      ]);
      const furnished = parseBoolean(rawFurnished);

      const created = new Property({
        title: firstDefined(body, ["title", "titulo"]),
        description: firstDefined(body, ["description", "descripcion"]),
        price,
        province: firstDefined(body, ["province", "provincia"]),
        city: firstDefined(body, ["city", "municipio"]),
        neighborhood: firstDefined(body, ["neighborhood", "sector"]),
        type: firstDefined(body, ["type", "tipo"]),
        bedrooms,
        bathrooms,
        halfBathrooms,
        parkingSpaces,
        builtArea,
        images: imagesPaths,
        furnished,
        createdBy: userId,
      });

      await created.save();
      res.status(201).json(toDTO(created));
    } catch (err) {
      next(err as any);
    }
  }
);

// mapper from mongoose doc to PropertyDTO
function toDTO(doc: any): PropertyDTO {
  if (!doc) return doc;
  return {
    id: doc._id?.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    province: doc.province,
    city: doc.city,
    neighborhood: doc.neighborhood,
    type: doc.type,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    halfBathrooms: doc.halfBathrooms,
    parkingSpaces: doc.parkingSpaces,
    builtArea: doc.builtArea,
    images: doc.images || [],
    furnished: doc.furnished,
    createdBy: doc.createdBy?.toString(),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  } as PropertyDTO;
}

// PUT /:id - actualizar una propiedad
propertiesRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await Property.findByIdAndUpdate(id, updates, {
        new: true,
      }).exec();
      if (!updated) {
        const e: any = new Error("Property not found");
        e.status = 404;
        return next(e);
      }
      res.json(updated);
    } catch (err) {
      next(err as any);
    }
  }
);

// DELETE /:id - eliminar una propiedad
propertiesRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await Property.findByIdAndDelete(id).exec();
      if (!deleted) {
        const e: any = new Error("Property not found");
        e.status = 404;
        return next(e);
      }
      res.status(204).send();
    } catch (err) {
      next(err as any);
    }
  }
);

export default propertiesRouter;
