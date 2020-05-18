import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/AuthRequest';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const myReq = req as AuthRequest;
    if (!myReq.user) {
        res.status(401).send({
            message: 'Requires authentication'
        });
    } else {
        next();
    }
};
