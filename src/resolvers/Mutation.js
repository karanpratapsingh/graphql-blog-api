import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getUserId from '../utils/getUserId';

const Mutation = {
    createUser: async (parent, args, { prisma }, info) => {

        if (args.data.password < 8) {
            throw new Error('Password must be 8 characters or long');
        }

        const password = await bcrypt.hash(args.data.password, 10);

        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password
            }
        });

        return {
            user,
            token: jwt.sign({ userId: user.id }, 'thisisasecret')
        };
    },
    login: async (parent, args, { prisma }, info) => {

        const user = await prisma.query.user({
            where: {
                email: args.data.email
            }
        });

        if (!user) throw new Error('Unable to login');

        const isMatch = bcrypt.compare(args.data.password, user.password);

        if (!isMatch) throw new Error('Unable to login');

        return {
            user,
            token: jwt.sign(user.id, 'thisisasecret')
        }

    },
    deleteUser: async (parent, args, { prisma, request }, info) => {

        const userId = getUserId(request);

        return prisma.mutation.deleteUser({ where: { id: userId } }, info);
    },
    updateUser: async (parent, { id, data }, { prisma, request }, info) => {

        const userId = getUserId(request);

        return prisma.mutation.updateUser({
            data,
            where: { id: userId }
        }, info);
    },
    createPost: async (parent, { data: { author, title, body, published } }, { prisma, request }, info) => {

        const userId = getUserId(request);

        return prisma.mutation.createPost({
            data: { title, body, published },
            author: { connect: { id: userId } }
        }, info);
    },
    deletePost: async (parent, { id }, { prisma, request }, info) => {

        const userId = getUserId(request);
        const postExists = await prisma.exists.Post({
            id,
            author: {
                id: userId
            }
        });

        if (!postExists) throw new Error('Unable to delete post');

        return prisma.mutation.deletePost({
            where: { id },

        }, info);
    },
    updatePost: async (parent, { id, data }, { prisma, request }, info) => {

        const userId = getUserId(request);

        const postExists = await prisma.exists.Post({
            id,
            author: {
                id: userId
            }
        });

        if (!postExists) throw new Error('Unable to update post');

        return prisma.mutation.updatePost({
            data,
            where: { id }
        }, info);
    },
    createComment: async (parent, { data: { author, post, text } }, { prisma, request }, info) => {

        const userId = getUserId(request);

        return prisma.mutation.createComment({
            data: {
                text,
                author: { connect: { id: userId } },
                post: { connect: { id: post } }
            }
        }, info);
    },
    deleteComment: async (parent, { id }, { prisma, request }, info) => {

        const userId = getUserId(request);

        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId
            }
        });

        if (!commentExists) throw new Error('Unable to delete the comment');

        return prisma.mutation.deleteComment({
            where: { id }
        }, info);
    },
    updateComment: async (parent, { id, data }, { prisma, request }, info) => {

        const userId = getUserId(request);

        const commentExists = await prisma.exists.Comment({
            id,
            author: {
                id: userId
            }
        });

        if (!commentExists) throw new Error('Unable to delete the comment');

        return prisma.mutation.updateComment({
            data,
            where: { id }
        }), info;
    }
};

export default Mutation;