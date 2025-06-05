import { RequestHandler, Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { z } from "zod";
import { createPost, createPostSlug, deletePost, getAllPosts, getPostBySlug, handleCover, updatePost } from "../services/postService";
import { getUserById } from "../services/userService";
import { coverToUrl } from "../utils/cover-to-url";

export const addPost = async (req: ExtendedRequest, res: Response) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    if (!req.user) {
        res.status(401).json({
            error: "Usuário não autenticado."
        });
        return
    }


    const schema = z.object({
        title: z.string().trim().min(1, 'Título é obrigatório'),
        tags: z.string().trim().min(1, 'Tags são obrigatórias'),
        body: z.string().trim().min(1, 'Corpo do post é obrigatório'),
    });


    console.log("Dados recebidos:", req.body);
    const data = schema.safeParse(req.body);
    if (!data.success) {
        res.status(400).json({
            error: data.error.flatten().fieldErrors
        });
        return
    }

    if (!req.file) {
        res.json({
            error: 'Sem arquivo'
        });
        return;
    }

    const coverName = await handleCover(req.file);
    if (!coverName) {
        res.status(400).json({
            error: 'Arquivo não permitido/enviado.'
        });
        return
    }

    //criar o slug do post
    const slug = await createPostSlug(data.data.title)

    //criar post
    const newPost = await createPost({
        authorId: req.user.id,
        slug,
        title: data.data.title,
        tags: data.data.tags,
        body: data.data.body,
        cover: coverName
    });

    //pegar informação do autor
    const author = await getUserById(newPost.authorId);

    //fazer retorno segundo o plano

    res.status(201).json({
        post: {
            id: newPost.id,
            slug: newPost.slug,
            title: newPost.title,
            createdAt: newPost.createdAt,
            cover: coverToUrl(newPost.cover),
            tags: newPost.tags,
            authorName: author?.name
        }
    })
}

export const editPost = async (req: ExtendedRequest, res: Response) => {
    const { slug } = req.params;

    const schema = z.object({
        status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
        title: z.string().optional(),
        tags: z.string().optional(),
        body: z.string().optional()
    });

    const data = schema.safeParse(req.body);

    if (!data.success) {
        res.json({ error: data.error.flatten().fieldErrors });
        return;
    }

    const post = await getPostBySlug(slug);
    if (!post) {
        res.json({ error: 'Post inexistente' });
        return;
    }

    let coverName: string | false | undefined = false;
    if (req.file) {
        coverName = await handleCover(req.file);
    }

    const updatedPost = await updatePost(slug, {
        updatedAt: new Date(),
        status: data.data.status ?? undefined,
        title: data.data.title ?? undefined,
        tags: data.data.title ?? undefined,
        body: data.data.title ?? undefined,
        cover: coverName ? coverName : undefined
    });

    const author = await getUserById(updatedPost.authorId);

    res.json({
        post: {
            id: updatedPost.id,
            status: updatedPost.status,
            slug: updatedPost.slug,
            title: updatedPost.title,
            createdAt: updatedPost.createdAt,
            cover: coverToUrl(updatedPost.cover),
            tags: updatedPost.tags,
            authorName: author?.name
        }
    });

}


export const removePost = async (req: ExtendedRequest, res: Response) => {
    const { slug } = req.params;

    const post = await getPostBySlug(slug);
    console.log("POST:", post)
    if (!post) {
        res.json({
            error: "Post inexistente"
        });
        return
    }

    await deletePost(post.slug);
    res.json({
        error: null
    });
}


export const getPosts = async (req: ExtendedRequest, res: Response) => {
    let page = 1;

    if (req.query.page) {
        page = parseInt(req.query.page as string);
        if (page <= 0) {
            res.json({
                error: "Página inexistente"
            });
            return
        }
    }

    let posts = await getAllPosts(page);
    console.log("post especififco: ", posts)
    const postsToReturn = posts.map(post => ({
        id: post.id,
        status: post.status,
        title: post.title,
        createAid: post.createdAt,
        cover: coverToUrl(post.cover),
        authorName: post.author?.name,
        tags: post.tags,
        slug: post.slug
    }));

    res.json({
        posts: postsToReturn,
        page
    });
}


export const getPost = async (req: ExtendedRequest, res: Response) => {
    const { slug } = req.params;

    const post = await getPostBySlug(slug);
    console.log("POST:", post)
    if (!post) {
        res.json({
            error: "Post inexistente"
        });
        return
    }

    res.json({
        post: {
            id: post.id,
            status: post.status,
            title: post.title,
            createAid: post.createdAt,
            cover: coverToUrl(post.cover),
            authorName: post.author?.name,
            tags: post.tags,
            slug: post.slug
        }
    })

}
