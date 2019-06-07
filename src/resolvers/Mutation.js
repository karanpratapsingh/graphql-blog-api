import uuidv4 from 'uuid/v4';

const Mutation = {
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
    updateUser: (parent, { id, data: { email, name, age } }, { db: { users } }, info) => {

        const user = users.find(user => user.id === id);

        if (!user) throw new Error('User not found');

        if (typeof email === 'string') {

            const emailTaken = users.some(user => user.email === email);

            if (emailTaken) throw new Error('Email taken');

            user.email = email;
        }

        if (typeof name === 'string') user.name = name;
        if (typeof age !== 'undefined') user.age = age;

        return user;
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
    updatePost: (parent, { id, data: { title, body, published } }, { db: { posts } }, info) => {

        const post = posts.find(post => post.id === id);

        if (!post) throw new Error('Post not found');

        if (typeof title === 'string') post.title = title;
        if (typeof body === 'string') post.body = body;
        if (typeof published === 'boolean') post.published = published;

        return post;
    },
    createComment: (parent, args, { db: { users, posts, comments, pubsub } }, info) => {

        let { text, author, post } = args.data;

        const userExists = users.some(user => user.id === author);

        const postExist = posts.some(post => post.id === post && post.published);

        if (!userExists || !postExist) throw new Error('Unable to find user and post');

        const comment = {
            id: uuidv4(),
            text, author, post
        };

        comments.push(comment);
        pubsub.publish(`comment ${post}`, { comment });

        return comment;
    },
    deleteComment: (parent, { id }, { db: { comments } }, info) => {

        const commentIndex = comments.findIndex(comment => comment.id === id);
        if (commentIndex === -1) throw new Error('Comment does not exist');

        const deletedComment = comments.slice(commentIndex, 1);

        return deletedComment[0];
    },
    updateComment: (parent, { id, data: { text } }, { db: { comments } }, info) => {

        const comment = comments.find(comment => comment.id === id);

        if (!comment) throw new Error('Comment not found');

        if (typeof text === 'string') comment.text = text;

        return comment;
    }
};

export default Mutation;