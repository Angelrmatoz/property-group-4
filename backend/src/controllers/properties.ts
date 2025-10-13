import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import Property from "@/models/property";
import authenticate from "@/middleware/auth";
import {
  uploadBufferToCloudinary,
  deleteMultipleFromCloudinary,
} from "@/utils/cloudinary";
import { PropertyDTO } from "@/dto/property";

const propertiesRouter = express.Router();

// configuración de multer -> usar memoria para enviar buffer a Cloudinary
const storage = multer.memoryStorage();

// Helper: accept a broad set of image MIME types and common image file extensions.
function isAcceptedImage(file: Express.Multer.File) {
  if (!file) return false;
  const mime = String(file.mimetype || "").toLowerCase();
  // If mimetype starts with image/ accept it (covers many cases)
  if (mime.startsWith("image/")) return true;

  // Fallback: check file extension in originalname for cases where the
  // browser/OS sends a generic mimetype like application/octet-stream.
  const name = String(file.originalname || "").toLowerCase();
  const ext = name.split(".").pop() || "";
  const acceptedExts = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif",
    "heic",
    "heif",
    "gif",
    "svg",
    "tif",
    "tiff",
    "bmp",
    "ico",
  ]);
  if (acceptedExts.has(ext)) return true;

  return false;
}

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (isAcceptedImage(file)) cb(null, true);
  else cb(new Error("Tipo de archivo no válido. Solo se permiten imágenes."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10, // max 10 files
    fieldSize: 10 * 1024 * 1024, // 10 MB for non-file fields
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

// Normalize property type values: accept Spanish and English inputs and
// return canonical English values used internally ('sale'|'rent').
function normalizeTypeValue(v: any): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "venta" || s === "sale") return "sale";
  if (s === "alquiler" || s === "rent") return "rent";
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

      // Server-side validation: description max length (2000 chars)
      // Coerce description to a string safely (handle arrays or non-string values)
      let rawDescription = firstDefined(body, ["description", "descripcion"]);
      if (Array.isArray(rawDescription)) rawDescription = rawDescription[0];
      const descString =
        rawDescription === undefined || rawDescription === null
          ? ""
          : String(rawDescription);
      if (descString.length > 2000) {
        // Return a clear validation error
        return res.status(400).json({
          error: "La descripción no puede superar los 2,000 caracteres.",
        });
      }

      // Server-side validation: title max length (100 chars)
      let rawTitle = firstDefined(body, ["title", "titulo"]);
      if (Array.isArray(rawTitle)) rawTitle = rawTitle[0];
      const titleString =
        rawTitle === undefined || rawTitle === null ? "" : String(rawTitle);
      if (titleString.length > 100) {
        return res.status(400).json({
          error: "El título no puede superar los 100 caracteres.",
        });
      }

      // if there are files, upload each to Cloudinary and collect URLs
      const imagesPaths: string[] = [];
      const files = (req as any).files as
        | (Express.Multer.File & { buffer?: Buffer })[]
        | undefined;

      if (files && files.length) {
        const maxBytes = 10 * 1024 * 1024; // 10 MB
        for (const file of files.slice(0, 10)) {
          if (!file.buffer) {
            continue;
          }

          // Validate MIME type / extension server-side again using centralized check
          if (!isAcceptedImage(file)) {
            console.error(
              `❌ [BACKEND] Imagen no válida: ${file.originalname}`
            );
            return res.status(400).json({
              error: `El archivo ${file.originalname} no es una imagen válida.`,
            });
          }

          // Validate file size
          if (file.size > maxBytes) {
            console.error(
              `❌ [BACKEND] Archivo muy grande: ${file.originalname} (${file.size} bytes)`
            );
            return res.status(400).json({
              error: `El archivo ${file.originalname} supera los 10 MB.`,
            });
          }

          try {
            const result = await uploadBufferToCloudinary(
              file.buffer,
              "properties"
            );

            const url = result?.secure_url || result?.url;

            if (url) imagesPaths.push(url);
          } catch (e) {
            console.error(
              `❌ [BACKEND] Error subiendo ${file.originalname} a Cloudinary:`,
              e
            );
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

      // Validaciones básicas: aceptar tanto claves en inglés como en español
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
          return res.status(400).json({
            error: `Missing required field: ${group.join("/")}`,
          });
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
      // parseBoolean returns boolean|undefined. Normalize to 'yes'|'no' string
      // to store in the DB while accepting legacy booleans and textual values.
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
);

// mapper from mongoose doc to PropertyDTO
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
    // Normalize type so API consumers always see the canonical English values
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
    // Normalize furnished to boolean for clients: 'yes' -> true, 'no' -> false,
    // or accept existing boolean values.
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

// PUT /:id - actualizar una propiedad
// PUT /:id - actualizar una propiedad
// Accept multipart/form-data so clients can send new images when updating.
propertiesRouter.put(
  "/:id",
  // accept up to 10 images with the field name 'images' (same as POST)
  upload.array("images", 10),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Development debug: log headers/cookies/X-CSRF-Token to diagnose CSRF failures
      if (process.env.NODE_ENV === "development") {
        try {
          console.log(
            "[PUT /api/properties/:id] Incoming headers:",
            req.headers
          );
          console.log(
            "[PUT /api/properties/:id] Cookies:",
            (req as any).cookies || req.headers.cookie
          );
          console.log(
            "[PUT /api/properties/:id] X-CSRF-Token header:",
            req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"]
          );
        } catch (e) {
          console.error("[PUT debug] failed to print debug info", e);
        }
      }
      const { id } = req.params;
      const body = req.body as any;

      // Server-side validation: description max length (2000 chars)
      // Coerce description to string safely (handle arrays or non-string values)
      let rawDescription = firstDefined(body, ["description", "descripcion"]);
      if (Array.isArray(rawDescription)) rawDescription = rawDescription[0];
      const descString =
        rawDescription === undefined || rawDescription === null
          ? ""
          : String(rawDescription);
      if (descString.length > 2000) {
        return res.status(400).json({
          error: "La descripción no puede superar los 2,000 caracteres.",
        });
      }

      // Server-side validation: title max length (100 chars) for updates
      let rawTitle = firstDefined(body, ["title", "titulo"]);
      if (Array.isArray(rawTitle)) rawTitle = rawTitle[0];
      const titleString =
        rawTitle === undefined || rawTitle === null ? "" : String(rawTitle);
      if (titleString && titleString.length > 100) {
        return res.status(400).json({
          error: "El título no puede superar los 100 caracteres.",
        });
      }

      // If there are files, upload each to Cloudinary and collect URLs
      const imagesPaths: string[] = [];
      const files = (req as any).files as
        | (Express.Multer.File & { buffer?: Buffer })[]
        | undefined;

      if (files && files.length) {
        const maxBytes = 10 * 1024 * 1024; // 10 MB
        for (const file of files.slice(0, 10)) {
          if (!file.buffer) continue;

          // Validate MIME type / extension server-side
          if (!isAcceptedImage(file)) {
            return res.status(400).json({
              error: `El archivo ${file.originalname} no es una imagen válida.`,
            });
          }

          // Validate file size
          if (file.size > maxBytes) {
            return res.status(400).json({
              error: `El archivo ${file.originalname} supera los 10 MB.`,
            });
          }

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

      // Fetch the current property to check which images are being removed
      const currentProperty = await Property.findById(id).exec();
      if (!currentProperty) {
        const e: any = new Error("Property not found");
        e.status = 404;
        return next(e);
      }

      // Collect existing images sent in the form. frontend app may append them
      // as 'images[]' or as 'images'. Support both.
      let existingImages: string[] = [];
      if (Array.isArray(body.images))
        existingImages = body.images.filter(Boolean);
      else if (Array.isArray(body["images[]"]))
        existingImages = body["images[]"].filter(Boolean);
      else if (typeof body.images === "string") existingImages = [body.images];
      else if (typeof body["images[]"] === "string")
        existingImages = [body["images[]"]];

      // Smart merge: if there are new uploaded images, use them as primary
      // and only keep existing images that weren't replaced
      let finalImages: string[];

      if (imagesPaths.length > 0) {
        // When there are new uploads, prioritize them and fill remaining slots with existing
        finalImages = [...imagesPaths];

        // Add existing images only up to the limit, avoiding duplicates
        for (const existingImg of existingImages) {
          if (finalImages.length >= 10) break;
          if (!finalImages.includes(existingImg)) {
            finalImages.push(existingImg);
          }
        }
      } else {
        // No new uploads, use existing images as-is
        finalImages = existingImages;
      }

      // Ensure we don't exceed the 10 image limit
      finalImages = finalImages.slice(0, 10);

      // Identify images that were removed (exist in DB but not in finalImages)
      // and delete them from Cloudinary
      if (currentProperty.images && currentProperty.images.length > 0) {
        const removedImages = currentProperty.images.filter(
          (img) => !finalImages.includes(img)
        );
        if (removedImages.length > 0) {
          try {
            await deleteMultipleFromCloudinary(removedImages);
            console.info(
              `[properties] Deleted ${removedImages.length} removed image(s) from Cloudinary for property ${id}`
            );
          } catch (cloudinaryError) {
            console.error(
              `[properties] Error deleting removed images from Cloudinary for property ${id}:`,
              cloudinaryError
            );
            // Don't fail the update if Cloudinary deletion fails
          }
        }
      }

      // Normalize numeric and boolean fields similarly to POST
      const bedrooms = getNumericFromBodyFlexible(body, [
        "bedrooms",
        "habitaciones",
      ]);
      const bathrooms = getNumericFromBodyFlexible(body, [
        "bathrooms",
        "banos",
        "baos",
      ]);
      const halfBathrooms = getNumericFromBodyFlexible(body, [
        "halfBathrooms",
        "mediosBanos",
        "mediosBaos",
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

      const rawFurnished = firstDefined(body, [
        "furnished",
        "amueblado",
        "mueblado",
      ]);
      const parsedFurnished = parseBoolean(rawFurnished);
      const furnished =
        parsedFurnished === undefined
          ? undefined
          : parsedFurnished
          ? "yes"
          : "no";

      // Build the update object explicitly so we control fields and types
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
);

// DELETE /:id - eliminar una propiedad
propertiesRouter.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // First, find the property to get its images
      const property = await Property.findById(id).exec();
      if (!property) {
        const e: any = new Error("Property not found");
        e.status = 404;
        return next(e);
      }

      // Delete images from Cloudinary if they exist
      if (
        property.images &&
        Array.isArray(property.images) &&
        property.images.length > 0
      ) {
        try {
          console.info(
            `[properties] Deleting ${property.images.length} image(s) from Cloudinary for property ${id}:`,
            property.images
          );
          await deleteMultipleFromCloudinary(property.images);
          console.info(
            `[properties] Successfully deleted ${property.images.length} image(s) from Cloudinary for property ${id}`
          );
        } catch (cloudinaryError) {
          // Log the error but don't fail the deletion
          console.error(
            `[properties] Error deleting images from Cloudinary for property ${id}:`,
            cloudinaryError
          );
        }
      } else {
        console.info(
          `[properties] No images to delete from Cloudinary for property ${id}`
        );
      }

      // Now delete the property from the database
      await Property.findByIdAndDelete(id).exec();

      res.status(204).send();
    } catch (err) {
      next(err as any);
    }
  }
);

export default propertiesRouter;
