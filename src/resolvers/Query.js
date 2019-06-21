const Query = {
    users: (parent, args, { prisma }, info) => {

        const opArgs = {};

        if (!args.query) {
            opArgs.where = {
                OR: [{
                    name_contains: args.query
                }, {
                    email_contains: args.query
                }]
            };
        }

        return prisma.query.users(opArgs, info);
    },
    posts: (parent, args, { prisma }, info) => {

        const opArgs = {};

        if (!args.query) {
            opArgs.where = {
                OR: [{
                    title_contains: args.query
                }, {
                    body_contains: args.query
                }]
            };
        }

        return prisma.query.posts(null, info);
    },
    comments: (parent, args, { db: { comments } }, info) => {
        return comments;
    },
    me: () => {
        return {
            id: '123098',
            name: 'Mike',
            email: 'mike@example.com'
        }
    },
    post: () => {
        return {
            id: '092',
            title: 'GraphQL 101',
            body: '',
            published: false
        }
    }
};

export default Query;