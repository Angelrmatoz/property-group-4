import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import Property from '@/models/property';
import { uploadBufferToCloudinary } from '@/utils/cloudinary';

const propertiesRouter = express.Router();

// configuración de multer -> usar memoria para enviar buffer a Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

function firstDefined<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined && obj[k] !== '') return obj[k];
  }
  return undefined;
}

function _toNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

// Normaliza una clave: lower + remover diacríticos (acentos)
function normalizeKey(k: string): string {
  return k
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function getNumericFromBodyFlexible(obj: any, targetNames: string[]): number | undefined {
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
      if (typeof v === 'string') {
        v = v.trim().replace(/,/g, '.');
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

// GET / - lista de propiedades con filtros simples
propertiesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, provincia, minPrecio, maxPrecio, limit, page } = req.query as any;

    const filter: any = {};
    if (tipo) filter.tipo = tipo;
    if (provincia) filter.provincia = provincia;
    if (minPrecio || maxPrecio) {
      filter.precio = {} as any;
      if (minPrecio) filter.precio.$gte = Number(minPrecio);
      if (maxPrecio) filter.precio.$lte = Number(maxPrecio);
    }

    const lim = Math.max(1, Number(limit) || 20);
    const pg = Math.max(0, Number(page) || 0);

    const items = await Property.find(filter).skip(pg * lim).limit(lim).exec();
    res.json(items);
  } catch (err) {
    next(err as any);
  }
});

// GET /:id - obtener una propiedad por id
propertiesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await Property.findById(id).exec();
    if (!item) {
      const e: any = new Error('Property not found');
      e.status = 404;
      return next(e);
    }
    res.json(item);
  } catch (err) {
    next(err as any);
  }
});

// POST /create - crear una nueva propiedad (acepta multipart/form-data con campo 'imagen')
propertiesRouter.post('/create', upload.single('imagen'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as any;

    // si hay archivo, subir a Cloudinary y obtener la URL
    let imagenPath: string | undefined = undefined;
    if ((req as any).file) {
      const file = (req as any).file as Express.Multer.File & { buffer?: Buffer };
      if (!file.buffer) return res.status(400).json({ error: 'No file buffer available' });
      try {
        const result = await uploadBufferToCloudinary(file.buffer, 'properties');
        imagenPath = result?.secure_url || result?.url || undefined;
      } catch (e) {
        return next(e as any);
      }
    }

    // Normalizar campos que pueden venir con o sin tildes
    const habitaciones = getNumericFromBodyFlexible(body, ['habitaciones']);
    const banos = getNumericFromBodyFlexible(body, ['banos', 'baos', 'baños']);
    const mediosBanos = getNumericFromBodyFlexible(body, ['mediosBanos', 'mediosBaOs', 'mediosBaños']);
    const parqueos = getNumericFromBodyFlexible(body, ['parqueos']);
    const construccion = getNumericFromBodyFlexible(body, ['construccion']);
    const precio = getNumericFromBodyFlexible(body, ['precio']);

    // Validaciones básicas
    const requiredStringFields = ['titulo', 'descripcion', 'provincia', 'municipio', 'sector', 'tipo'];
    for (const f of requiredStringFields) {
      if (!firstDefined(body, [f])) {
        return res.status(400).json({ error: `Missing required field: ${f}` });
      }
    }

    const missingNums: string[] = [];
    if (precio === undefined) missingNums.push('precio');
    if (habitaciones === undefined) missingNums.push('habitaciones');
    if (banos === undefined) missingNums.push('baños');
    if (mediosBanos === undefined) missingNums.push('mediosBaños');
    if (parqueos === undefined) missingNums.push('parqueos');
    if (construccion === undefined) missingNums.push('construccion');
    if (missingNums.length) {
      return res.status(400).json({ error: `Numeric fields missing or invalid: ${missingNums.join(', ')}` });
    }

    const created = new Property({
      titulo: firstDefined(body, ['titulo']),
      descripcion: firstDefined(body, ['descripcion']),
      precio,
      provincia: firstDefined(body, ['provincia']),
      municipio: firstDefined(body, ['municipio']),
      sector: firstDefined(body, ['sector']),
      tipo: firstDefined(body, ['tipo']),
      habitaciones,
      banos,
      mediosBanos,
      parqueos,
      construccion,
      imagen: imagenPath,
    });

    await created.save();
    res.status(201).json(created);
  } catch (err) {
    next(err as any);
  }
});

// PUT /:id - actualizar una propiedad
propertiesRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Property.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (!updated) {
      const e: any = new Error('Property not found');
      e.status = 404;
      return next(e);
    }
    res.json(updated);
  } catch (err) {
    next(err as any);
  }
});

// DELETE /:id - eliminar una propiedad
propertiesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id).exec();
    if (!deleted) {
      const e: any = new Error('Property not found');
      e.status = 404;
      return next(e);
    }
    res.status(204).send();
  } catch (err) {
    next(err as any);
  }
});

export default propertiesRouter;
