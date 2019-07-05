import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    deleteUser: async (parent, { id }, { db: { users, posts, comments }, prisma }, info) => {

        return prisma.mutation.deleteUser({ where: { id } }, info);
    },
    updateUser: async (parent, { id, data }, { prisma }, info) => {

        return prisma.mutation.updateUser({
            data,
            where: { id }
        }, info);
    },
    createPost: async (parent, { data: { author, title, body, published } }, { prisma }, info) => {

        return prisma.mutation.createPost({
            data: { title, body, published },
            author: { connect: { id: author } }
        }, info);
    },
    deletePost: (parent, { id }, { db: { posts, comments }, prisma }, info) => {

        return prisma.mutation.deletePost({
            where: { id }
        }, info);
    },
    updatePost: (parent, { id, data }, { prisma }, info) => {

        return prisma.mutation.updatePost({
            data,
            where: { id }
        }, info);
    },
    createComment: async (parent, { data: { author, post, text } }, { prisma }, info) => {

        return prisma.mutation.createComment({
            data: {
                text,
                author: { connect: { id: author } },
                post: { connect: { id: post } }
            }
        }, info);
    },
    deleteComment: async (parent, { id }, { prisma }, info) => {

        return prisma.mutation.deleteComment({
            where: { id }
        }, info);
    },
    updateComment: (parent, { id, data }, { prima }, info) => {

        return prisma.mutation.updateComment({
            data,
            where: { id }
        }), info;
    }
};

export default Mutation;