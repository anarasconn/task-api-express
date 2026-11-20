import type { Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { UserModel } from '../models/user.js';
import { loginUser, registerUser } from '../services/auth.service.js';

export const postRegister = async (_req: Request, res: Response): Promise<void> => {
  res.status(201).json({ data: await registerUser(res.locals.registerInput) });
};

export const postLogin = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ data: await loginUser(res.locals.loginInput) });
};

export const getMe = async (_req: Request, res: Response): Promise<void> => {
  const auth = res.locals.auth;
  if (!auth?.userId) {
    throw new AppError('No autenticado.', 401, 'AUTHENTICATION_REQUIRED');
  }

  const userDoc = await UserModel.findById(auth.userId);
  if (!userDoc) {
    throw new AppError('Usuario no encontrado.', 404, 'USER_NOT_FOUND');
  }

  const user = {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    createdAt: userDoc.createdAt.toISOString(),
    updatedAt: userDoc.updatedAt.toISOString(),
  };

  res.status(200).json({
    data: {
      user,
      identity: auth,
    },
  });
};
