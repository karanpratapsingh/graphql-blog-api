const Subscription = {
    post: {
        subscribe: (parent, args, { prisma }, info) => {

            return prisma.subscription.posts({
                where: { node: { published: true } }
            }, info);
        }
    },
    comment: {
        subscribe: (parent, { postId }, { prisma }, info) => {

            return prisma.subscription.comment({
                where: { node: { post: { id: postId } } }
            }, info);
        }
    }
};

export { Subscription as default };