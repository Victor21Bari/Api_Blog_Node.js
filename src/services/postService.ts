import { v4 } from "uuid";
import fs from 'fs/promises'
import slug from "slug";
import { prisma } from "../libs/prisma";
import { Prisma } from "@prisma/client";


export const getPostBySlug = async (slug: string) => {
    return await prisma.post.findUnique({
        where: { slug },
        include: {
            author: {
                select: {
                    name: true
                }
            }
        }
    });
}

export const getAllPosts = async (page: number) => {
    let perPage = 5;
    if (page <= 0) return [];

    const posts = await prisma.post.findMany({
        include: {
            author: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5,
        skip: (page - 1) * perPage
    });

    return posts;


}


export const getPublishedPosts = async (page: number) => {
    let perPage = 5;
    if (page <= 0) return [];

    const posts = await prisma.post.findMany({
        where: {
            status: 'PUBLISHED'
        },
        include: {
            author: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5,
        skip: (page - 1) * perPage
    });

    return posts;


}


export const handleCover = async (file: Express.Multer.File) => {
    try {

        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];

        if (allowed.includes(file.mimetype)) {
            const coverName = `${v4()}.jpg`;
            await fs.rename(
                file.path,
                `./public/imagens/cover/${coverName}`
            );
            console.log('coverName: ', coverName)
            return coverName

        }
    } catch (error) {
        console.log('Erro na imagem', file.mimetype)
        return false
    }
}

export const getPostsWhitSameTags = async (slug: string) => {
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) {
        return [];
    }

    const tags = post.tags.split(',');
    if(tags.length === 0) return [];

    const posts = await prisma.post.findMany({
           where: {
            status: 'PUBLISHED',
            slug: { not: slug },
            OR: tags.map(term => ({
                tags: { contains: term, mode: 'insensitive' }
            }))
        },
        include: {
            author: {
                select: {
                    name: true
                }
            }
        },
        take: 4,
        orderBy: {
            createdAt: 'desc'
        }
    });

    return posts;

}



export const createPostSlug = async (title: string) => {
    let newSlug = slug(title);
    let keepTrying = true;
    let postCount = 1;

    while (keepTrying) {
        const post = await getPostBySlug(newSlug);
        if (!post) {
            keepTrying = false;
        } else {
            newSlug = slug(`${title}-${postCount++}`);
        }
    }

    return newSlug;
}

type CreatePostProps = {
    authorId: number,
    slug: string,
    title: string,
    tags: string,
    body: string,
    cover: string
}
export const createPost = async (data: CreatePostProps) => {
    return await prisma.post.create({ data });
}

export const updatePost = async (slug: string, data: Prisma.PostUpdateInput) => {
    return await prisma.post.update({
        where: { slug },
        data
    });
}

export const deletePost = async (slug: string) => {
    return await prisma.post.delete({
        where: { slug }
    });
}