import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4';
import db from './db';

// Resolvers
const resolvers = {
    Query: {
        users: (parent, args, { db: { users } }, info) => {

            if (!args.query) return users;
            return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()));
        },
        posts: (parent, args, { db: { posts } }, info) => {

            if (!args.query) return posts;
            return posts.filter(post => {

                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());

                return isTitleMatch || isBodyMatch;
            })
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
    },
    Mutation: {

        createUser: (parent, args, { db: { users } }, info) => {

            let { name, email, age } = args.data;

            const emailTaken = users.some(user => user.email === email);

            if (emailTaken) throw new Error('Email Taken');

            const user = {

                id: uuidv4(),
                name, email, age
            };

            users.push(user);

            return user;
        },
        deleteUser: (parent, { id }, { db: { users, posts, comments } }, info) => {

            const userIndex = users.findIndex(user => user.id === id);

            if (userIndex === -1) throw new Error('User not found');

            const deletedUsers = users.slice(userIndex, 1);

            posts = posts.filter(post => {

                const match = post.author === id;

                if (match) comments = comments.filter(comment => comment.post !== post.id);

                return !match;
            });

            comments = comments.filter(comment => comment.author !== id);

            return deletedUsers[0];
        },
        createPost: (parent, args, { db: { users, posts } }, info) => {

            let { title, body, published, author } = args.data;

            const userExists = users.some(user => user.id === author);

            if (userExists) throw new Error('User not found');

            const post = {

                id: uuidv4(),
                title, body, published, author
            };

            posts.push(user);

            return post;
        },
        deletePost: (parent, { id }, { db: { posts, comments } }, info) => {

            const postIndex = posts.findIndex(post => post.id === id);

            if (postIndex === -1) throw new Error('Post does not exist');

            const deletedPost = posts.slice(postIndex, 1);

            comments = comments.filter(comment => comment.post !== id);

            return deletedPost[0];
        },
        createComment: (parent, args, { db: { users, posts, comments } }, info) => {

            let { text, author, post } = args.data;

            const userExists = users.some(user => user.id === author);

            const postExist = posts.some(post => post.id === post && post.published);

            if (!userExists || !postExist) throw new Error('Unable to find user and post');

            const comment = {
                id: uuidv4(),
                text, author, post
            };

            comments.push(comment);

            return comment;
        },
        deleteComment: (parent, { id }, { db: { comments } }, info) => {

            const commentIndex = comments.findIndex(comment => comment.id === id);
            if (commentIndex === -1) throw new Error('Comment does not exist');

            const deletedComment = comments.slice(commentIndex, 1);

            return deletedComment[0];
        }
    },
    Post: {
        author: (parent, args, { db: { users } }, info) => {
            return users.find(user => user.id === parent.author)
        },
        comments: (parent, args, { db: { comments } }, info) => {
            return comments.filter(comment => comment.post === parent.id)
        }
    },
    Comment: {
        author: (parent, args, { db: { users } }, info) => {
            return users.find(user => user.id === parent.author)
        },
        post: (parent, args, { db: { posts } }, info) => {
            return posts.find(post => post.id === parent.post)
        }
    },
    User: {
        posts: (parent, args, { db: { posts } }, info) => {
            return posts.filter(post => post.author === parent.id)
        },
        comments: (parent, args, { db: { comments } }, info) => {
            return comments.filter(comment => comment.author === parent.id)
        }
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: { db }
})

server.start(() => {
    console.log('The server is up!')
})