import express, { Request, Response, NextFunction } from 'express';
import Property from '@/models/property';

const propertiesRouter = express.Router();

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

// POST /create - crear una nueva propiedad
propertiesRouter.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const created = new Property(body);
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
