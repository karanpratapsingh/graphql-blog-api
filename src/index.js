import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4';
// Scalar types - String, Boolean, Int, Float, ID

// Demo user data
let users = [{
    id: '1',
    name: 'Andrew',
    email: 'andrew@example.com',
    age: 27
}, {
    id: '2',
    name: 'Sarah',
    email: 'sarah@example.com'
}, {
    id: '3',
    name: 'Mike',
    email: 'mike@example.com'
}]

let posts = [{
    id: '10',
    title: 'GraphQL 101',
    body: 'This is how to use GraphQL...',
    published: true,
    author: '1'
}, {
    id: '11',
    title: 'GraphQL 201',
    body: 'This is an advanced GraphQL post...',
    published: false,
    author: '1'
}, {
    id: '12',
    title: 'Programming Music',
    body: '',
    published: true,
    author: '2'
}]

let comments = [{
    id: '102',
    text: 'This worked well for me. Thanks!',
    author: '3',
    post: '10'
}, {
    id: '103',
    text: 'Glad you enjoyed it.',
    author: '1',
    post: '11'
}, {
    id: '104',
    text: 'This did no work.',
    author: '2',
    post: '12'
}, {
    id: '105',
    text: 'Nevermind. I got it to work.',
    author: '1',
    post: '12'
}]

// Resolvers
const resolvers = {
    Query: {
        users: (parent, args, ctx, info) => {

            if (!args.query) return users;
            return users.filter(user => user.name.toLowerCase().includes(args.query.toLowerCase()));
        },
        posts: (parent, args, ctx, info) => {

            if (!args.query) return posts;
            return posts.filter(post => {

                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase());
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase());

                return isTitleMatch || isBodyMatch;
            })
        },
        comments: (parent, args, ctx, info) => {
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

        createUser: (parent, args, ctx, info) => {

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
        deleteUser: (parent, { id }, ctx, info) => {

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
        createPost: (parent, args, ctx, info) => {

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
        deletePost: (parent, { id }, ctx, info) => {

            const postIndex = posts.findIndex(post => post.id === id);

            if (postIndex === -1) throw new Error('Post does not exist');

            const deletedPost = posts.slice(postIndex, 1);

            comments = comments.filter(comment => comment.post !== id);

            return deletedPost[0];
        },
        createComment: (parent, args, ctx, info) => {

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
        deleteComment: (parent, {id}, ctx, info) => {

            const commentIndex = comments.findIndex(comment => comment.id === id);
            if (commentIndex === -1) throw new Error('Comment does not exist');

            const deletedComment = comments.slice(commentIndex, 1);

            return deletedComment[0];
        }
    },
    Post: {
        author: (parent, args, ctx, info) => {
            return users.find(user => user.id === parent.author)
        },
        comments: (parent, args, ctx, info) => {

            return comments.filter(comment => comment.post === parent.id)
        }
    },
    Comment: {
        author: (parent, args, ctx, info) => {
            return users.find(user => user.id === parent.author)
        },
        post: (parent, args, ctx, info) => {

            return posts.find(post => post.id === parent.post)
        }
    },
    User: {
        posts: (parent, args, ctx, info) => {
            return posts.filter(post => post.author === parent.id)
        },
        comments: (parent, args, ctx, info) => {
            return comments.filter(comment => comment.author === parent.id)
        }
    }
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers
})

server.start(() => {
    console.log('The server is up!')
})