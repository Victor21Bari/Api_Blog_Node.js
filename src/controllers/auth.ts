import { RequestHandler } from "express";
import { z } from "zod";
import { CreateUser, verifyUser } from "../services/userService";
import { createToken } from "../services/authService";
import { ExtendedRequest } from "../types/extended-request";
import {Response} from 'express';


export const signup: RequestHandler = async (req, res) => {
    const schema = z.object({
        name: z.string(),
        email: z.string().email('E-mail inválido'),
        password: z.string()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            error: result.error.flatten().fieldErrors
        });
        return;
    }

    try {
        const newUser = await CreateUser(result.data);

        if (!newUser) {
            res.status(500).json({
                error: 'Erro ao criar usuário.'
            });
            return;
        }

        const token = createToken(newUser);
        

        res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            },
            token
        });

    } catch (err) {
        res.status(500).json({
            error: 'Erro interno no servidor.'
        });
        return;
    }
};

export const signin: RequestHandler = async (req, res) => {
    const schema = z.object({
        email: z.string().email('E-mail inválido'),
        password: z.string()
    });

    const data = schema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            error: data.error.flatten().fieldErrors
        });
        return;
    }

    const user = await verifyUser(data.data); 
    if(!user) {
        res.status(500).json({
            error: 'Usuário ou senha inválido(s).'
        });
        return
    }

    const token = createToken(user);

    res.status(200).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        },
        token
    });
};


export const validate = (req: ExtendedRequest, res: Response) => {
    res.json({ user: req.user });
}
