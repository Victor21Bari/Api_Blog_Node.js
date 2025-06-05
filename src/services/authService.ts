import { User } from "@prisma/client";
import { createJWT, readJWT } from "../libs/jwt";
import { TokenPayload } from "../types/token-payload";
import { getUserById } from "./userService";
import {Request} from 'express';

export const createToken = (user: User) => {
    return createJWT({ id: user.id });
}

export const verifyrequest = async (req: Request) => {
    const authorization = req.headers.authorization;

    if (authorization) {
        const authSplit = authorization.split('Bearer ');
        if (authSplit[1]) {
            const payload = readJWT(authSplit[1]);
            if(payload){
                const userId = (payload as TokenPayload).id
                const user = await getUserById(userId);
                if (user){
                    return user;
                } 
            }
        }
    }else{
        return false
    }


}
