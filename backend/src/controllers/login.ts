import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/user';
import * as Config from '@/utils/config';
import { HttpError, RegisterDTO, LoginDTO, UserDTO } from '@/dto';

const loginRouter = express.Router();

// Registro de usuario
loginRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as RegisterDTO;

    if (!body || !body.email || !body.password || !body.nombre || !body.apellido) {
        return next(new HttpError(400, 'Missing required fields'));
    }

    try {
        const existing = await User.findOne({ email: body.email });
        if (existing) {
            return next(new HttpError(409, 'User already exists'));
        }

        const user = new User({
            nombre: body.nombre,
            apellido: body.apellido,
            email: body.email,
        });

        // Usamos el virtual 'password' para que el pre('save') haga el hash
        (user as any).password = body.password;

        await user.save();

        const userDto: UserDTO = {
            id: user._id.toString(),
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
        };

        return res.status(201).json({ user: userDto });
    } catch (err) {
        return next(new HttpError(500, 'Internal server error'));
    }
});

// Login
loginRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as LoginDTO;

    if (!body || !body.email || !body.password) {
        return next(new HttpError(400, 'Missing email or password'));
    }

    try {
        const user = await User.findOne({ email: body.email });
        if (!user) return next(new HttpError(401, 'Invalid credentials'));

        const isMatch = await (user as any).comparePassword(body.password);
        if (!isMatch) return next(new HttpError(401, 'Invalid credentials'));

        if (!Config.JWT_SECRET) {
            return next(new HttpError(500, 'Server configuration error'));
        }

        const payload = { id: user._id.toString(), email: user.email };
        const token = jwt.sign(payload, Config.JWT_SECRET, { expiresIn: '1h' });

        const userDto: UserDTO = {
            id: user._id.toString(),
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
        };

        return res.status(200).json({ token, user: userDto });
    } catch (err) {
        return next(new HttpError(500, 'Internal server error'));
    }
});

export default loginRouter;
