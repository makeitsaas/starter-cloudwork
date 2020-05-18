import { Request } from 'express';

export interface AuthRequest extends Request{
    user: void|{id: string, email: string}
}
