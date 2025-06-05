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
    
    console.log('Esse é o auth:', authorization)

    if (authorization) {
        const authSplit = authorization.split('Bearer ');
        if (authSplit[1]) {
            console.log("o auth é esse: ", authSplit[1])
            const payload = readJWT(authSplit[1]);
            if(payload){
                console.log('payload:', payload)
                const userId = (payload as TokenPayload).id
                console.log("Esse é o userId: ", userId)
                const user = await getUserById(userId);
                if (user){
                    console.log("Esse é o ussuario", user)
                    return user;
                } 
            }
        }
    }else{
        return false
    }


}
