import { Request, Response, NextFunction } from "express";
import multer from "multer";
import Property from "@/models/property";
import {
  uploadBufferToCloudinary,
  deleteMultipleFromCloudinary,
} from "../config/cloudinary";
import { PropertyDTO } from "@/dto/property";

export const storage = multer.memoryStorage();

export function isAcceptedImage(file: Express.Multer.File): boolean {
  if (!file) return false;
  const mime = String(file.mimetype || "").toLowerCase();
  if (mime.startsWith("image/")) return true;

  const name = String(file.originalname || "").toLowerCase();
  const ext = name.split(".").pop() || "";
  const acceptedExts = new Set([
    "jpg", "jpeg", "png", "webp", "avif", "heic", "heif",
    "gif", "svg", "tif", "tiff", "bmp", "ico",
  ]);
  if (acceptedExts.has(ext)) return true;
  return false;
}

export const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (isAcceptedImage(file)) cb(null, true);
  else cb(new Error("Tipo de archivo no válido. Solo se permiten imágenes."));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
    fieldSize: 10 * 1024 * 1024,
  },
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

function getNumericFromBodyFlexible(
  obj: any,
  targetNames: string[],
): number | undefined {
  if (!obj) return undefined;
  const map: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const nk = key.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    map[nk] = obj[key];
  }
  for (const t of targetNames) {
    const nt = t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (nt in map) {
      let v = map[nt];
      if (Array.isArray(v)) v = v[0];
      if (typeof v === "string") v = v.trim().replace(/,/g, ".");
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export function parseBoolean(val: any): boolean | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  const s = String(val).trim().toLowerCase();
  if (["1", "true", "si", "sí", "on", "yes"].includes(s)) return true;
  if (["0", "false", "no", "off"].includes(s)) return false;
  return undefined;
}

export function normalizeTypeValue(v: any): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "venta" || s === "sale") return "sale";
  if (s === "alquiler" || s === "rent") return "rent";
  return undefined;
}

function toDTO(doc: any): PropertyDTO {
  if (!doc) return doc;
  return {
    id: doc._id?.toString(),
    title: doc.title,
    description: doc.description,
    price: doc.price,
    currency: doc.currency || "USD",
    province: doc.province,
    city: doc.city,
    neighborhood: doc.neighborhood,
    type: (function (v: any) {
      if (!v) return v;
      const s = String(v).trim().toLowerCase();
      if (s === "venta") return "sale";
      if (s === "alquiler") return "rent";
      if (s === "sale" || s === "rent") return s;
      return s;
    })(doc.type),
    category: doc.category,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms,
    halfBathrooms: doc.halfBathrooms,
    parkingSpaces: doc.parkingSpaces,
    builtArea: doc.builtArea,
    images: doc.images || [],
    furnished: (function (v: any) {
      if (v === true || v === "true" || v === "yes") return true;
      if (v === false || v === "false" || v === "no") return false;
      return Boolean(v);
    })(doc.furnished),
    createdBy: doc.createdBy?.toString(),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toISOString()
      : new Date().toISOString(),
  } as PropertyDTO;
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { type, province, minPrice, maxPrice, limit, page } = req.query as any;
    const filter: any = {};
    if (type) {
      const nt = normalizeTypeValue(type);
      if (nt) filter.type = nt;
    }
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
    res.json(items.map((it: any) => toDTO(it)));
  } catch (err) {
    next(err as any);
  }
}

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as any;

    let rawDescription = firstDefined(body, ["description", "descripcion"]);
    if (Array.isArray(rawDescription)) rawDescription = rawDescription[0];
    const descString =
      rawDescription === undefined || rawDescription === null
        ? ""
        : String(rawDescription);
    if (descString.length > 2000) {
      res.status(400).json({
        error: "La descripción no puede superar los 2,000 caracteres.",
      });
      return;
    }

    let rawTitle = firstDefined(body, ["title", "titulo"]);
    if (Array.isArray(rawTitle)) rawTitle = rawTitle[0];
    const titleString =
      rawTitle === undefined || rawTitle === null ? "" : String(rawTitle);
    if (titleString.length > 100) {
      res.status(400).json({
        error: "El título no puede superar los 100 caracteres.",
      });
      return;
    }

    const imagesPaths: string[] = [];
    const files = (req as any).files as
      | (Express.Multer.File & { buffer?: Buffer })[]
      | undefined;

    if (files && files.length) {
      const maxBytes = 10 * 1024 * 1024;
      for (const file of files.slice(0, 10)) {
        if (!file.buffer) continue;
        if (!isAcceptedImage(file)) {
          res.status(400).json({
            error: `El archivo ${file.originalname} no es una imagen válida.`,
          });
          return;
        }
        if (file.size > maxBytes) {
          res.status(400).json({
            error: `El archivo ${file.originalname} supera los 10 MB.`,
          });
          return;
        }
        try {
          const result = await uploadBufferToCloudinary(file.buffer, "properties");
          const url = result?.secure_url || result?.url;
          if (url) imagesPaths.push(url);
        } catch (e) {
          return next(e as any);
        }
      }
    }

    const bedrooms = getNumericFromBodyFlexible(body, ["bedrooms", "habitaciones"]);
    const bathrooms = getNumericFromBodyFlexible(body, ["bathrooms", "banos", "baños"]);
    const halfBathrooms = getNumericFromBodyFlexible(body, ["halfBathrooms", "mediosBanos", "mediosBaños"]);
    const parkingSpaces = getNumericFromBodyFlexible(body, ["parkingSpaces", "parqueos"]);
    const builtArea = getNumericFromBodyFlexible(body, ["builtArea", "construccion"]);
    const price = getNumericFromBodyFlexible(body, ["price", "precio"]);

    const requiredStringFieldGroups: string[][] = [
      ["title", "titulo"],
      ["description", "descripcion"],
      ["province", "provincia"],
      ["city", "municipio"],
      ["neighborhood", "sector"],
      ["type", "tipo"],
      ["category", "categoria"],
    ];
    for (const group of requiredStringFieldGroups) {
      if (!firstDefined(body, group)) {
        res.status(400).json({ error: `Missing required field: ${group.join("/")}` });
        return;
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
      res.status(400).json({
        error: `Numeric fields missing or invalid: ${missingNums.join(", ")}`,
      });
      return;
    }

    const userId = (req as any).user && (req as any).user.id;

    const rawFurnished = firstDefined(body, ["furnished", "amueblado", "mueblado"]);
    const parsedFurnished = parseBoolean(rawFurnished);
    const furnished =
      parsedFurnished === undefined
        ? undefined
        : parsedFurnished
        ? "yes"
        : "no";

    const created = new Property({
      title: firstDefined(body, ["title", "titulo"]),
      description: firstDefined(body, ["description", "descripcion"]),
      price,
      currency: firstDefined(body, ["currency", "moneda"]) || "USD",
      province: firstDefined(body, ["province", "provincia"]),
      city: firstDefined(body, ["city", "municipio"]),
      neighborhood: firstDefined(body, ["neighborhood", "sector"]),
      type: normalizeTypeValue(firstDefined(body, ["type", "tipo"])),
      category: firstDefined(body, ["category", "categoria"]),
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

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as any;

    let rawDescription = firstDefined(body, ["description", "descripcion"]);
    if (Array.isArray(rawDescription)) rawDescription = rawDescription[0];
    const descString =
      rawDescription === undefined || rawDescription === null
        ? ""
        : String(rawDescription);
    if (descString.length > 2000) {
      res.status(400).json({
        error: "La descripción no puede superar los 2,000 caracteres.",
      });
      return;
    }

    let rawTitle = firstDefined(body, ["title", "titulo"]);
    if (Array.isArray(rawTitle)) rawTitle = rawTitle[0];
    const titleString =
      rawTitle === undefined || rawTitle === null ? "" : String(rawTitle);
    if (titleString && titleString.length > 100) {
      res.status(400).json({
        error: "El título no puede superar los 100 caracteres.",
      });
      return;
    }

    const imagesPaths: string[] = [];
    const files = (req as any).files as
      | (Express.Multer.File & { buffer?: Buffer })[]
      | undefined;

    if (files && files.length) {
      const maxBytes = 10 * 1024 * 1024;
      for (const file of files.slice(0, 10)) {
        if (!file.buffer) continue;
        if (!isAcceptedImage(file)) {
          res.status(400).json({
            error: `El archivo ${file.originalname} no es una imagen válida.`,
          });
          return;
        }
        if (file.size > maxBytes) {
          res.status(400).json({
            error: `El archivo ${file.originalname} supera los 10 MB.`,
          });
          return;
        }
        try {
          const result = await uploadBufferToCloudinary(file.buffer, "properties");
          const url = result?.secure_url || result?.url;
          if (url) imagesPaths.push(url);
        } catch (e) {
          return next(e as any);
        }
      }
    }

    const currentProperty = await Property.findById(id).exec();
    if (!currentProperty) {
      const e: any = new Error("Property not found");
      e.status = 404;
      return next(e);
    }

    const normalizeImageInput = (input: any): string[] => {
      if (!input && input !== "") return [];
      if (Array.isArray(input)) {
        return input.map((i) => (typeof i === "string" ? i.trim() : i)).filter(Boolean);
      }
      if (typeof input === "string") {
        if (input.includes(",")) return input.split(",").map((s) => s.trim()).filter(Boolean);
        return [input.trim()].filter(Boolean);
      }
      return [];
    };

    let existingImages: string[] = [];
    existingImages = [
      ...normalizeImageInput(body.images),
      ...normalizeImageInput(body["images[]"]),
    ];

    let finalImages: string[];
    if (imagesPaths.length > 0) {
      finalImages = [...imagesPaths];
      for (const existingImg of existingImages) {
        if (finalImages.length >= 10) break;
        if (!finalImages.includes(existingImg)) finalImages.push(existingImg);
      }
    } else {
      finalImages = existingImages;
    }
    finalImages = finalImages.slice(0, 10);

    const sanitized: string[] = [];
    for (const it of finalImages) {
      if (!it || typeof it !== "string") continue;
      const parts = it.includes(",") ? it.split(",") : [it];
      for (const p of parts) {
        const t = p.trim();
        if (t && !sanitized.includes(t)) sanitized.push(t);
      }
    }
    finalImages = sanitized.slice(0, 10);

    if (currentProperty.images && currentProperty.images.length > 0) {
      const removedImages = currentProperty.images.filter(
        (img) => !finalImages.includes(img),
      );
      if (removedImages.length > 0) {
        try {
          await deleteMultipleFromCloudinary(removedImages);
        } catch (cloudinaryError) {
          console.error(
            `[properties] Error deleting removed images from Cloudinary for property ${id}:`,
            cloudinaryError,
          );
        }
      }
    }

    const bedrooms = getNumericFromBodyFlexible(body, ["bedrooms", "habitaciones"]);
    const bathrooms = getNumericFromBodyFlexible(body, ["bathrooms", "banos", "baños"]);
    const halfBathrooms = getNumericFromBodyFlexible(body, ["halfBathrooms", "mediosBanos", "mediosBaños"]);
    const parkingSpaces = getNumericFromBodyFlexible(body, ["parkingSpaces", "parqueos"]);
    const builtArea = getNumericFromBodyFlexible(body, ["builtArea", "construccion"]);
    const price = getNumericFromBodyFlexible(body, ["price", "precio"]);

    const rawFurnished = firstDefined(body, ["furnished", "amueblado", "mueblado"]);
    const parsedFurnished = parseBoolean(rawFurnished);
    const furnished =
      parsedFurnished === undefined
        ? undefined
        : parsedFurnished
        ? "yes"
        : "no";

    const updates: any = {};
    const title = firstDefined(body, ["title", "titulo"]);
    if (title !== undefined) updates.title = title;
    const description = firstDefined(body, ["description", "descripcion"]);
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    const currency = firstDefined(body, ["currency", "moneda"]);
    if (currency !== undefined) updates.currency = currency;
    const province = firstDefined(body, ["province", "provincia"]);
    if (province !== undefined) updates.province = province;
    const city = firstDefined(body, ["city", "municipio"]);
    if (city !== undefined) updates.city = city;
    const neighborhood = firstDefined(body, ["neighborhood", "sector"]);
    if (neighborhood !== undefined) updates.neighborhood = neighborhood;
    const typeRaw = firstDefined(body, ["type", "tipo"]);
    const type = normalizeTypeValue(typeRaw);
    if (type !== undefined) updates.type = type;
    const category = firstDefined(body, ["category", "categoria"]);
    if (category !== undefined) updates.category = category;
    if (bedrooms !== undefined) updates.bedrooms = bedrooms;
    if (bathrooms !== undefined) updates.bathrooms = bathrooms;
    if (halfBathrooms !== undefined) updates.halfBathrooms = halfBathrooms;
    if (parkingSpaces !== undefined) updates.parkingSpaces = parkingSpaces;
    if (builtArea !== undefined) updates.builtArea = builtArea;
    if (finalImages.length) updates.images = finalImages;
    if (furnished !== undefined) updates.furnished = furnished;

    const updated = await Property.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
    if (!updated) {
      const e: any = new Error("Property not found");
      e.status = 404;
      return next(e);
    }
    res.json(toDTO(updated));
  } catch (err) {
    next(err as any);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).exec();
    if (!property) {
      const e: any = new Error("Property not found");
      e.status = 404;
      return next(e);
    }

    if (
      property.images &&
      Array.isArray(property.images) &&
      property.images.length > 0
    ) {
      try {
        await deleteMultipleFromCloudinary(property.images);
      } catch (cloudinaryError) {
        console.error(
          `[properties] Error deleting images from Cloudinary for property ${id}:`,
          cloudinaryError,
        );
      }
    }

    await Property.findByIdAndDelete(id).exec();
    res.status(204).send();
  } catch (err) {
    next(err as any);
  }
}
