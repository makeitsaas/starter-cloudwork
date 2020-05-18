import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../interfaces/AuthRequest';
const verifier: GoogleVerifierInterface = require('google-id-token-verifier');

const GOOGLE_CLIENT_ID = '466852553679-mr3776nm8tnh1flbno6t38smjokensle.apps.googleusercontent.com';

export const checkJWTMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    if(req.headers.authorization && /^Bearer .+$/.test(req.headers.authorization)) {
        const jwt = req.headers.authorization.split(' ')[1];
        verifier.verify(jwt, GOOGLE_CLIENT_ID, (err, tokenInfo) => {
            if (tokenInfo) {
                const myReq = req as AuthRequest;
                myReq.user = {
                    id: `google:${tokenInfo.sub}`,
                    email: tokenInfo.email,
                }
            }
            next();
        });
    } else {
        next();
    }
};

interface GoogleVerifierInterface {
    verify: (jwt: string, clientId: string, callback: (error: any, tokenInfo: GoogleIdInterface|void) => void) => void
}

interface GoogleIdInterface {
    iss: string
    azp: string
    aud: string
    sub: string
    email: string
    email_verified: boolean
    at_hash: string
    name: string
    picture: string
    given_name: string
    family_name: string
    locale: string
    iat: number
    exp: number
    jti: string
}
