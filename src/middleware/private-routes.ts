import { NextFunction, Response, Request} from "express";
import { verifyrequest } from "../services/authService";
import { ExtendedRequest } from "../types/extended-request";

export const privateRoute = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const user = await verifyrequest(req);
        if(!user){
            res.status(401).json({ error: 'Acesso negado.'});
            return;
        }
        req.user = user;
        next();
}